import { useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { DateInput } from '@astryxdesign/core/DateInput'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { DEFAULT_DAYS, DEFAULT_END_HOUR, DEFAULT_DURATION, MAX_DAYS, MAX_END_HOUR } from './config.js'
import { todayISO } from './time.js'
import Timetable from './Timetable.jsx'
import Storage from './Storage.jsx'
import BlockDialog from './BlockDialog.jsx'
import './plan.css'

// 일정표 짜기 (plan) — 지도와 따로 쓰는 전체 화면. 기획은 PLANNER_plan.md
// map 코드를 가져다 쓸 수는 있지만, map이 plan을 가져다 쓰지는 않는다 (plan을 떼어 내도 map은 그대로 동작)
export default function PlanPage() {
  const [startDate, setStartDate] = useState(todayISO())
  const [days, setDays] = useState(DEFAULT_DAYS)
  const [endHour, setEndHour] = useState(DEFAULT_END_HOUR)
  const [blocks, setBlocks] = useState([])
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

  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: '#fff' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>
        <Button label="← 지도로" href="#/" variant="ghost" size="sm" />
        <Heading level={1}>일정표 짜기</Heading>
      </header>

      {/* 여행 날짜: 출발일 + 며칠. 바꾸면 표가 바로 다시 그려진다 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12, padding: '12px 16px 0' }}>
        <DateInput label="출발일" value={startDate} onChange={(v) => v && setStartDate(v)} width={180} />
        <NumberInput label="며칠" value={days} onChange={(v) => setDays(Math.min(MAX_DAYS, Math.max(1, Math.round(v))))} min={1} max={MAX_DAYS} width={100} />
      </div>

      <div className="plan-body">
        <Storage blocks={blocks} onNew={() => openEditor(null)} onEdit={openEditor} />
        <Timetable startDate={startDate} days={days} endHour={endHour} onAddHour={() => setEndHour((h) => Math.min(MAX_END_HOUR, h + 1))} />
        <aside className="plan-box">
          <b>메모</b>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#666' }}>메모 칸은 다음 단계에서 추가돼요.</p>
        </aside>
      </div>

      {editing && (
        <BlockDialog key={editing.n} isOpen block={editing.block} onSave={saveBlock} onDelete={deleteBlock} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
