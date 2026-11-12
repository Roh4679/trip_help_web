// 일정표 자동 저장 (PLANNER_plan.md 3.8, 4장). 브라우저 localStorage에 표 여러 개(엑셀 시트처럼)를 한 묶음으로 저장한다
// 표 하나: { startDate, days, endHour, memo, blocks } / 묶음: { sheets: [{ id, name, plan }], activeId }
import { DEFAULT_DAYS, DEFAULT_END_HOUR, MAX_DAYS, MAX_END_HOUR, BLOCK_COLORS, SLOT_MIN } from './config.js'

export const BOOK_KEY = 'trip-planner-book'
export const OLD_KEY = 'trip-planner' // 표가 하나뿐이던 때의 저장 위치. 있으면 '표 1'로 옮겨 온다

export function emptyPlan(startDate) {
  return { startDate, days: DEFAULT_DAYS, endHour: DEFAULT_END_HOUR, memo: '', blocks: [] }
}

const isInt = (n) => Number.isInteger(n)
const validBlock = (b) =>
  b && typeof b.id === 'string' && typeof b.title === 'string' && isInt(b.color) && b.color >= 0 && b.color < BLOCK_COLORS.length &&
  isInt(b.duration) && b.duration >= SLOT_MIN && b.duration % SLOT_MIN === 0 &&
  ((b.day == null && b.start == null) || (isInt(b.day) && isInt(b.start)))

// 일정표 하나 검사. 모양이 다르면 null. 블록 하나만 이상하면 그 블록만 버리고, 사라진 날의 블록은 보관함으로 돌린다
export function checkPlan(p) {
  if (!p || typeof p.startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(p.startDate)) return null
  const days = isInt(p.days) ? Math.min(MAX_DAYS, Math.max(1, p.days)) : DEFAULT_DAYS
  const endHour = isInt(p.endHour) ? Math.min(MAX_END_HOUR, Math.max(DEFAULT_END_HOUR, p.endHour)) : DEFAULT_END_HOUR
  const blocks = (Array.isArray(p.blocks) ? p.blocks : [])
    .filter(validBlock)
    .map((b) => (b.day != null && (b.day < 1 || b.day > days) ? { ...b, day: null, start: null } : b))
  return { startDate: p.startDate, days, endHour, memo: typeof p.memo === 'string' ? p.memo : '', blocks }
}

const parse = (raw) => {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// 다음 표 이름: 표 1, 표 2 … (지운 번호는 다시 쓰지 않고 가장 큰 번호 + 1)
export function nextSheetName(sheets) {
  const nums = sheets.map((s) => Number(/^표 (\d+)$/.exec(s.name)?.[1] ?? 0))
  return `표 ${Math.max(0, ...nums) + 1}`
}

export function newSheet(sheets, startDate, id = crypto.randomUUID()) {
  return { id, name: nextSheetName(sheets), plan: emptyPlan(startDate) }
}

// 저장된 글자 → 표 묶음. 깨진 표는 버리고, 하나도 없으면 null
export function parseBook(raw) {
  const b = parse(raw)
  if (!b || !Array.isArray(b.sheets)) return null
  const sheets = b.sheets
    .filter((s) => s && typeof s.id === 'string' && typeof s.name === 'string')
    .map((s) => ({ ...s, plan: checkPlan(s.plan) }))
    .filter((s) => s.plan)
  if (!sheets.length) return null
  return { sheets, activeId: sheets.some((s) => s.id === b.activeId) ? b.activeId : sheets[0].id }
}

// 처음 열 때: 저장된 묶음 → 없으면 예전 표 하나를 '표 1'로 → 그것도 없으면 빈 '표 1'
export function loadBook(storage, startDate) {
  let book = null
  let old = null
  try {
    book = parseBook(storage.getItem(BOOK_KEY))
    old = checkPlan(parse(storage.getItem(OLD_KEY)))
  } catch {
    // 저장소를 못 쓰는 환경(사생활 보호 모드 등)이면 새로 시작
  }
  if (book) return book
  const first = { id: 'sheet-1', name: '표 1', plan: old ?? emptyPlan(startDate) }
  return { sheets: [first], activeId: first.id }
}

export function saveBook(storage, book) {
  try {
    storage.setItem(BOOK_KEY, JSON.stringify(book))
    storage.removeItem(OLD_KEY) // 옮겨 온 예전 표는 지운다
  } catch {
    // 저장소가 가득 찼거나 못 쓰면 저장만 건너뛴다 (화면은 그대로 동작)
  }
}
