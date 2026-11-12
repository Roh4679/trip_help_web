import { useState } from 'react'
import { DAY_START_MIN, ROW_PX, SLOT_MIN } from './config.js'
import { snap } from './schedule.js'

const CLICK_PX = 4 // 이만큼도 안 움직이고 떼면 끌기가 아니라 누르기 (블록 고치기 창)

// 커서 아래가 어디인지: 표의 하루 칸이면 { kind: 'day', day, start(30분에 맞춘 시각) }, 보관함이면 { kind: 'storage' }
// offsetY: 블록 윗변에서 커서까지 거리(px). 잡은 위치 그대로 블록 윗변 시각을 계산한다
function targetAt(x, y, offsetY) {
  const el = document.elementFromPoint(x, y)
  if (el?.closest('[data-plan-storage]')) return { kind: 'storage' }
  const col = el?.closest('[data-plan-day]')
  if (!col) return null
  const top = col.getBoundingClientRect().top
  return { kind: 'day', day: Number(col.dataset.planDay), start: snap(DAY_START_MIN + ((y - offsetY - top) / ROW_PX) * SLOT_MIN) }
}

// 블록 끌기 (PC 마우스 기준, PLANNER_plan.md 5장). drag = { id, x, y, offsetY, target } 이면 끄는 중
// onDrop(id, target): 놓았을 때 (target이 null이면 표·보관함 밖이라 취소), onClick(block): 안 움직이고 뗐을 때
export function useBlockDrag({ onDrop, onClick }) {
  const [drag, setDrag] = useState(null)

  const start = (e, block, offsetY) => {
    if (e.button !== 0) return
    e.preventDefault() // 끄는 동안 글자가 선택되지 않게
    const origin = { x: e.clientX, y: e.clientY }
    let last = null
    const move = (ev) => {
      if (!last && Math.hypot(ev.clientX - origin.x, ev.clientY - origin.y) < CLICK_PX) return
      last = { id: block.id, x: ev.clientX, y: ev.clientY, offsetY, target: targetAt(ev.clientX, ev.clientY, offsetY) }
      setDrag(last)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setDrag(null)
      if (last) onDrop(block.id, last.target)
      else onClick(block)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return { drag, start }
}
