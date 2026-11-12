import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'

// 일정표 짜기 (plan) — 지도와 따로 쓰는 전체 화면. 기획은 PLANNER_plan.md
// map 코드를 가져다 쓸 수는 있지만, map이 plan을 가져다 쓰지는 않는다 (plan을 떼어 내도 map은 그대로 동작)
export default function PlanPage() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: '#fff' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>
        <Button label="← 지도로" href="#/" variant="ghost" size="sm" />
        <Heading level={1}>일정표 짜기</Heading>
      </header>
      <main style={{ padding: 24 }}>
        <p style={{ margin: 0, color: '#666' }}>일정표 짜기 기능을 준비하고 있어요.</p>
      </main>
    </div>
  )
}
