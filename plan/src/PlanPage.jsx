import { useEffect, useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { TabList, Tab } from '@astryxdesign/core/TabList'
import { AlertDialog } from '@astryxdesign/core/AlertDialog'
import { todayISO } from './time.js'
import { loadBook, saveBook, newSheet } from './persist.js'
import PlanSheet from './PlanSheet.jsx'
import './plan.css'
import { COLOR } from '../../shared/tokens.js'

// 일정표 짜기 (plan) — 지도와 따로 쓰는 전체 화면. 기획은 PLANNER_plan.md
// map 코드를 가져다 쓸 수는 있지만, map이 plan을 가져다 쓰지는 않는다 (plan을 떼어 내도 map은 그대로 동작)
// 엑셀 시트처럼 표를 여러 개 두고 탭으로 오간다. [+ 새 일정표]는 지우지 않고 '표 N'을 새로 만든다
export default function PlanPage() {
  // 처음 열 때 브라우저에 저장된 표들을 불러온다 (없으면 빈 '표 1')
  const [book, setBook] = useState(() => loadBook(window.localStorage, todayISO()))
  const active = book.sheets.find((s) => s.id === book.activeId)

  // 바뀔 때마다 자동 저장 (표 목록, 지금 보는 표, 각 표의 블록·날짜·메모)
  useEffect(() => {
    saveBook(window.localStorage, book)
  }, [book])

  const select = (id) => setBook((b) => ({ ...b, activeId: id }))
  const updateActive = (plan) => setBook((b) => ({ ...b, sheets: b.sheets.map((s) => (s.id === b.activeId ? { ...s, plan } : s)) }))
  const addSheet = () =>
    setBook((b) => {
      const sheet = newSheet(b.sheets, todayISO())
      return { sheets: [...b.sheets, sheet], activeId: sheet.id }
    })

  // [이 표 지우기]: 확인 창 뒤 지금 표를 지우고 옆 표로 (표가 하나뿐이면 지울 수 없다)
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const deleteActive = () => {
    setBook((b) => {
      const i = b.sheets.findIndex((s) => s.id === b.activeId)
      const sheets = b.sheets.filter((s) => s.id !== b.activeId)
      return { sheets, activeId: sheets[Math.max(0, i - 1)].id }
    })
    setDeleteOpen(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: COLOR.surface }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${COLOR.border}` }}>
        <Button label="← 지도로" href="#/" variant="ghost" size="sm" />
        <Heading level={1}>일정표 짜기</Heading>
      </header>

      {/* 표 탭 (엑셀 시트처럼): 표 1, 표 2 … + 새 일정표, 이 표 지우기 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: '8px 16px 0' }}>
        <TabList value={book.activeId} onChange={select} role="tablist" aria-label="일정표 목록" size="sm">
          {book.sheets.map((s) => <Tab key={s.id} value={s.id} label={s.name} />)}
        </TabList>
        <Button label="+ 새 일정표" variant="secondary" size="sm" onClick={addSheet} />
        <Button label="이 표 지우기" variant="ghost" size="sm" isDisabled={book.sheets.length < 2} onClick={() => setDeleteOpen(true)} />
        <p style={{ margin: 0, flexBasis: '100%', fontSize: 12, color: COLOR.textSub }}>
          자동으로 이 브라우저에 저장돼요. 다른 브라우저·기기에서는 안 보이고, 브라우저 데이터(캐시·쿠키)를 지우면 사라져요.
        </p>
      </div>

      {/* 표를 바꾸면 key가 바뀌어 그 표의 내용으로 새로 그린다 */}
      <PlanSheet key={active.id} initial={active.plan} name={active.name} onChange={updateActive} />

      <AlertDialog
        isOpen={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        title={`${active.name}을(를) 지울까요?`}
        description="이 표의 블록, 날짜, 메모가 모두 지워져요. 되돌릴 수 없어요."
        actionLabel="지우기"
        onAction={deleteActive}
      />
    </div>
  )
}
