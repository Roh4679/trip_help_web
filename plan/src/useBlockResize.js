import { useState } from 'react'
import { ROW_PX, SLOT_MIN } from './config.js'
import { snap } from './schedule.js'

// 블록 아래쪽 끝을 끌어 길이 바꾸기 (30분 단위, 최소 30분). resize = { id, duration } 이면 끄는 중
// onEnd(id, duration): 손을 뗐을 때 (밀어내기 계산은 부르는 쪽에서)
export function useBlockResize({ onEnd }) {
  const [resize, setResize] = useState(null)

  const start = (e, block) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation() // 블록 옮기기(끌기)가 같이 시작되지 않게
    const y0 = e.clientY
    let duration = block.duration
    const move = (ev) => {
      duration = Math.max(SLOT_MIN, snap(block.duration + ((ev.clientY - y0) / ROW_PX) * SLOT_MIN))
      setResize({ id: block.id, duration })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setResize(null)
      if (duration !== block.duration) onEnd(block.id, duration)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return { resize, start }
}
