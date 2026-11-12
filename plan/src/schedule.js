// 일정 블록 계산 (PLANNER_plan.md 3.5·3.6). 화면과 분리한 순수 함수: 입력 배열을 고치지 않고 새 배열을 돌려준다
// 블록: { id, title, color, day, start, duration } — day는 1부터, start는 그날 0시 기준 분, day가 null이면 보관함
// 모든 함수는 { blocks, endHour, stored } 를 돌려준다. stored = 표 끝(최대 오전 6:00)을 넘어 보관함으로 옮긴 블록 id
import { SLOT_MIN, DAY_START_MIN, MAX_END_HOUR } from './config.js'

const MAX_END_MIN = MAX_END_HOUR * 60
const end = (b) => b.start + b.duration

// 30분 단위로 가장 가까운 칸에 맞춘다
export const snap = (min) => Math.round(min / SLOT_MIN) * SLOT_MIN

// 기준 블록이 끝나는 시각부터 아래 블록들을 겹치지 않게 차례로 민다 (연쇄 밀림)
// 대상: 같은 날, 기준 블록이 시작한 뒤에 끝나는 블록 (기준 블록 중간에 걸친 블록 포함). 그 전에 끝나는 위 블록은 그대로
function pushDown(blocks, anchor, endHour) {
  let cursor = end(anchor)
  let maxEnd = cursor
  const stored = []
  const below = blocks
    .filter((b) => b.id !== anchor.id && b.day === anchor.day && end(b) > anchor.start)
    .sort((a, b) => a.start - b.start)
  const moved = new Map()
  for (const b of below) {
    const start = Math.max(b.start, cursor)
    if (start + b.duration > MAX_END_MIN) {
      stored.push(b.id) // 하루 24시간을 넘으면 보관함으로
      continue
    }
    if (start !== b.start) moved.set(b.id, start)
    cursor = start + b.duration
    maxEnd = Math.max(maxEnd, cursor)
  }
  const next = blocks.map((b) => {
    if (stored.includes(b.id)) return { ...b, day: null, start: null }
    if (moved.has(b.id)) return { ...b, start: moved.get(b.id) }
    return b
  })
  return { blocks: next, endHour: Math.max(endHour, Math.ceil(maxEnd / 60)), stored }
}

// 블록을 표의 (day, start)에 놓는다. 보관함 블록·표 안 블록 모두. 놓은 자리와 그 아래 블록이 겹치는 만큼 밀린다
// 놓은 자리가 다른 블록의 중간이면 그 블록은 놓은 블록이 끝나는 시각으로 밀린다
export function placeBlock(blocks, id, day, start, endHour) {
  const block = blocks.find((b) => b.id === id)
  const s = Math.min(Math.max(snap(start), DAY_START_MIN), MAX_END_MIN - block.duration) // 표 안에 들어오게
  const placed = { ...block, day, start: s }
  return pushDown(blocks.map((b) => (b.id === id ? placed : b)), placed, endHour)
}

// 블록 길이를 바꾼다 (30분 단위, 최소 30분). 늘어나면 아래 블록이 밀리고, 줄어들면 아래 블록은 당겨지지 않는다
export function resizeBlock(blocks, id, duration, endHour) {
  const block = blocks.find((b) => b.id === id)
  const d = Math.max(SLOT_MIN, snap(duration))
  const fit = Math.min(d, MAX_END_MIN - block.start) // 하루 24시간을 넘게 늘리지 않는다
  const resized = { ...block, duration: fit }
  return pushDown(blocks.map((b) => (b.id === id ? resized : b)), resized, endHour)
}

// 블록을 보관함으로 뺀다. 빈 시간은 그대로 (아래 블록을 당기지 않는다)
export function storeBlock(blocks, id) {
  return blocks.map((b) => (b.id === id ? { ...b, day: null, start: null } : b))
}

// 여행 일수를 바꾼다. 사라지는 날의 블록은 보관함으로 옮기고 그 id를 알려 준다
export function changeDays(blocks, days) {
  const stored = blocks.filter((b) => b.day != null && b.day > days).map((b) => b.id)
  return { blocks: blocks.map((b) => (stored.includes(b.id) ? { ...b, day: null, start: null } : b)), stored }
}
