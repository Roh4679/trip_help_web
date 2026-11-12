import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { DateInput } from '@astryxdesign/core/DateInput'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { useToast } from '@astryxdesign/core/Toast'
import { TextArea } from '@astryxdesign/core/TextArea'
import { AlertDialog } from '@astryxdesign/core/AlertDialog'
import { DEFAULT_DURATION, MAX_DAYS, MAX_END_HOUR } from './config.js'
import { todayISO } from './time.js'
import { placeBlock, resizeBlock, storeBlock, changeDays } from './schedule.js'
import { useBlockDrag } from './useBlockDrag.js'
import { useBlockResize } from './useBlockResize.js'
import { loadPlan, savePlan, emptyPlan } from './persist.js'
import { downloadPlanPng } from './exportPng.js'
import Timetable from './Timetable.jsx'
import Storage from './Storage.jsx'
import BlockCard from './BlockCard.jsx'
import BlockDialog from './BlockDialog.jsx'
import './plan.css'

const GHOST_WIDTH = 140 // 끄는 동안 커서를 따라다니는 블록 너비 (px)

// 일정표 짜기 (plan) — 지도와 따로 쓰는 전체 화면. 기획은 PLANNER_plan.md
// map 코드를 가져다 쓸 수는 있지만, map이 plan을 가져다 쓰지는 않는다 (plan을 떼어 내도 map은 그대로 동작)
export default function PlanPage() {
  const toast = useToast()
  // 처음 열 때 브라우저에 저장된 일정표를 불러온다 (없으면 오늘 출발 새 일정표)
  const [saved] = useState(() => loadPlan(window.localStorage, todayISO()))
  const [startDate, setStartDate] = useState(saved.startDate)
  const [days, setDays] = useState(saved.days)
  const [memo, setMemo] = useState(saved.memo)
  // 블록과 표 끝 시간은 밀어내기 계산이 같이 바꾸므로 한 묶음으로 둔다
  const [sched, setSched] = useState({ blocks: saved.blocks, endHour: saved.endHour })
  const schedRef = useRef(sched) // 끌기를 시작한 뒤에도 놓는 순간의 최신 값으로 계산하려고
  useLayoutEffect(() => {
    schedRef.current = sched
  })
  const { blocks, endHour } = sched

  // 바뀔 때마다 자동 저장 (블록, 날짜, 메모)
  useEffect(() => {
    savePlan(window.localStorage, { startDate, days, endHour, memo, blocks })
  }, [startDate, days, endHour, memo, blocks])

  // [+ 새 일정표]: 확인 창을 거쳐 지금 일정을 지우고 새로 시작
  const [isResetOpen, setResetOpen] = useState(false)
  const resetPlan = () => {
    const p = emptyPlan(todayISO())
    setStartDate(p.startDate)
    setDays(p.days)
    setMemo(p.memo)
    setSched({ blocks: p.blocks, endHour: p.endHour })
    setResetOpen(false)
  }

  const setBlocks = (fn) => setSched((s) => ({ ...s, blocks: fn(s.blocks) }))

  // 표 끝(최대 오전 6:00)을 넘거나 날짜가 줄어 보관함으로 옮긴 블록이 있으면 알려 준다
  const tellStored = (ids, why) => {
    if (!ids.length) return
    const names = ids.map((id) => schedRef.current.blocks.find((b) => b.id === id)?.title).join(', ')
    toast({ body: `${names} · ${why} 보관함으로 옮겼어요`, uniqueID: 'plan-stored' })
  }

  // 블록 창: null이면 닫힘, { block: null }이면 새 블록, { block }이면 고치기. n은 열 때마다 창을 새로 그리는 key
  const [editing, setEditing] = useState(null)
  const openEditor = (block) => setEditing({ block, n: (editing?.n ?? 0) + 1 })
  const saveBlock = ({ title, color }) => {
    const target = editing.block
    setBlocks((bs) =>
      target
        ? bs.map((b) => (b.id === target.id ? { ...b, title, color } : b))
        : [...bs, { id: crypto.randomUUID(), title, color, day: null, start: null, duration: DEFAULT_DURATION }],
    )
    setEditing(null)
  }
  const deleteBlock = () => {
    setBlocks((bs) => bs.filter((b) => b.id !== editing.block.id))
    setEditing(null)
  }

  // 끌어다 놓기: 표의 하루 칸이면 30분 칸에 맞춰 놓고 아래 블록을 밀어낸다, 보관함이면 표에서 뺀다, 그 밖이면 취소
  const { drag, start: startDrag } = useBlockDrag({
    onClick: openEditor,
    onDrop: (id, target) => {
      const s = schedRef.current
      if (target?.kind === 'storage') return setSched({ ...s, blocks: storeBlock(s.blocks, id) })
      if (target?.kind !== 'day') return
      const r = placeBlock(s.blocks, id, target.day, target.start, s.endHour)
      setSched({ blocks: r.blocks, endHour: r.endHour })
      tellStored(r.stored, '하루 24시간을 넘어서')
    },
  })

  // 아래쪽 끝 끌기: 늘어나면 아래 블록이 밀리고, 줄어들면 그대로
  const { resize, start: startResize } = useBlockResize({
    onEnd: (id, duration) => {
      const s = schedRef.current
      const r = resizeBlock(s.blocks, id, duration, s.endHour)
      setSched({ blocks: r.blocks, endHour: r.endHour })
      tellStored(r.stored, '하루 24시간을 넘어서')
    },
  })

  // 끄는 동안, 손을 떼면 어떻게 될지 미리 보여 준다 (밀릴 블록은 흐리게, 옮기거나 늘리는 블록은 점선)
  const preview = useMemo(() => {
    if (resize) return resizeBlock(blocks, resize.id, resize.duration, endHour)
    if (drag?.target?.kind === 'day') return placeBlock(blocks, drag.id, drag.target.day, drag.target.start, endHour)
    return null
  }, [drag, resize, blocks, endHour])
  const shown = preview ?? sched
  const activeId = drag?.id ?? resize?.id
  const look = (b) => {
    if (!activeId) return null
    if (b.id === activeId) return preview ? 'moving' : 'lifted'
    const before = blocks.find((o) => o.id === b.id)
    return preview && before.start !== b.start ? 'pushed' : null
  }

  const changeDayCount = (v) => {
    const n = Math.min(MAX_DAYS, Math.max(1, Math.round(v)))
    const r = changeDays(blocks, n)
    tellStored(r.stored, '날짜가 줄어서')
    setBlocks(() => r.blocks)
    setDays(n)
  }

  const dragged = drag && blocks.find((b) => b.id === drag.id)

  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: '#fff', cursor: drag ? 'grabbing' : resize ? 'ns-resize' : undefined }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>
        <Button label="← 지도로" href="#/" variant="ghost" size="sm" />
        <Heading level={1}>일정표 짜기</Heading>
      </header>

      {/* 여행 날짜: 출발일 + 며칠. 바꾸면 표가 바로 다시 그려진다 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12, padding: '12px 16px 0' }}>
        <DateInput label="출발일" value={startDate} onChange={(v) => v && setStartDate(v)} width={180} />
        <NumberInput label="며칠" value={days} onChange={changeDayCount} min={1} max={MAX_DAYS} width={100} />
        <Button label="PNG로 저장" variant="primary" onClick={() => downloadPlanPng({ startDate, days, endHour, memo, blocks })} />
        <Button label="+ 새 일정표" variant="secondary" onClick={() => setResetOpen(true)} />
        <p style={{ margin: 0, flexBasis: '100%', fontSize: 12, color: '#666' }}>
          자동으로 이 브라우저에 저장돼요. 다른 브라우저·기기에서는 안 보이고, 브라우저 데이터(캐시·쿠키)를 지우면 사라져요.
        </p>
      </div>

      <div className="plan-body">
        <Storage blocks={blocks} onNew={() => openEditor(null)} onEdit={openEditor} onDragStart={startDrag} isDropTarget={drag?.target?.kind === 'storage'} />
        <Timetable
          startDate={startDate}
          days={days}
          endHour={shown.endHour}
          blocks={shown.blocks}
          look={look}
          onDragStart={startDrag}
          onResizeStart={startResize}
          onEdit={openEditor}
          onAddHour={() => setSched((s) => ({ ...s, endHour: Math.min(MAX_END_HOUR, s.endHour + 1) }))}
        />
        <aside className="plan-box">
          <TextArea label="메모" placeholder="준비물, 예약 번호, 숙소 등 자유롭게" value={memo} onChange={setMemo} rows={14} />
        </aside>
      </div>

      {/* 끄는 동안 커서를 따라다니는 블록 (마우스 이벤트는 그 아래로 통과) */}
      {dragged && (
        <div style={{ position: 'fixed', left: drag.x - GHOST_WIDTH / 2, top: drag.y - drag.offsetY, width: GHOST_WIDTH, pointerEvents: 'none', opacity: 0.85, zIndex: 20 }}>
          <BlockCard block={dragged} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} />
        </div>
      )}

      <AlertDialog
        isOpen={isResetOpen}
        onOpenChange={setResetOpen}
        title="새 일정표를 만들까요?"
        description="지금 일정(블록, 날짜, 메모)이 모두 지워져요. 되돌릴 수 없어요."
        actionLabel="지우고 새로 만들기"
        onAction={resetPlan}
      />

      {editing && (
        <BlockDialog key={editing.n} isOpen block={editing.block} onSave={saveBlock} onDelete={deleteBlock} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
