// 일정표 자동 저장 (PLANNER_plan.md 3.8, 4장). 브라우저 localStorage에 한 개만 저장한다
// 저장 모양: { startDate, days, endHour, memo, blocks }
import { DEFAULT_DAYS, DEFAULT_END_HOUR, MAX_DAYS, MAX_END_HOUR, BLOCK_COLORS, SLOT_MIN } from './config.js'

export const STORAGE_KEY = 'trip-planner'

export function emptyPlan(startDate) {
  return { startDate, days: DEFAULT_DAYS, endHour: DEFAULT_END_HOUR, memo: '', blocks: [] }
}

const isInt = (n) => Number.isInteger(n)
const validBlock = (b) =>
  b && typeof b.id === 'string' && typeof b.title === 'string' && isInt(b.color) && b.color >= 0 && b.color < BLOCK_COLORS.length &&
  isInt(b.duration) && b.duration >= SLOT_MIN && b.duration % SLOT_MIN === 0 &&
  ((b.day == null && b.start == null) || (isInt(b.day) && isInt(b.start)))

// 저장된 글자 → 일정표. 깨졌거나 모양이 다르면 null (그때는 새 일정표로 시작)
// 블록 하나만 이상하면 그 블록만 버리고, 사라진 날의 블록은 보관함으로 돌린다
export function parsePlan(raw) {
  let p
  try {
    p = JSON.parse(raw)
  } catch {
    return null
  }
  if (!p || typeof p.startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(p.startDate)) return null
  const days = isInt(p.days) ? Math.min(MAX_DAYS, Math.max(1, p.days)) : DEFAULT_DAYS
  const endHour = isInt(p.endHour) ? Math.min(MAX_END_HOUR, Math.max(DEFAULT_END_HOUR, p.endHour)) : DEFAULT_END_HOUR
  const blocks = (Array.isArray(p.blocks) ? p.blocks : [])
    .filter(validBlock)
    .map((b) => (b.day != null && (b.day < 1 || b.day > days) ? { ...b, day: null, start: null } : b))
  return { startDate: p.startDate, days, endHour, memo: typeof p.memo === 'string' ? p.memo : '', blocks }
}

export function loadPlan(storage, startDate) {
  try {
    return parsePlan(storage.getItem(STORAGE_KEY)) ?? emptyPlan(startDate)
  } catch {
    return emptyPlan(startDate) // 저장소를 못 쓰는 환경(사생활 보호 모드 등)
  }
}

export function savePlan(storage, plan) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(plan))
  } catch {
    // 저장소가 가득 찼거나 못 쓰면 저장만 건너뛴다 (화면은 그대로 동작)
  }
}
