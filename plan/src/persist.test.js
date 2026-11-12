// 실행: node plan/src/persist.test.js — 자동 저장 읽기·쓰기 (표 여러 개)
import assert from 'node:assert/strict'
import { checkPlan, parseBook, loadBook, saveBook, emptyPlan, nextSheetName, newSheet, BOOK_KEY, OLD_KEY } from './persist.js'

// 기획서 4장 예시가 그대로 읽힌다
const sample = {
  startDate: '2026-04-08', days: 5, endHour: 25, memo: '숙소: 알레우 리조트',
  blocks: [
    { id: 'b1', title: '점심 먹기', color: 3, day: 1, start: 720, duration: 60 },
    { id: 'b2', title: '박물관', color: 5, day: null, start: null, duration: 90 },
  ],
}
assert.deepEqual(checkPlan(sample), sample)
assert.equal(checkPlan(null), null)
assert.equal(checkPlan({ days: 3 }), null) // 날짜 없음

// 이상한 블록은 버리고, 범위 밖 값은 맞춘다
const odd = checkPlan({
  startDate: '2026-04-08', days: 2, endHour: 99,
  blocks: [
    { id: 'ok', title: 'A', color: 0, day: 1, start: 600, duration: 30 },
    { id: 'bad-color', title: 'B', color: 9, day: 1, start: 600, duration: 30 },
    { id: 'bad-dur', title: 'C', color: 0, day: 1, start: 600, duration: 45 },
    { id: 'gone-day', title: 'D', color: 0, day: 5, start: 600, duration: 60 },
  ],
})
assert.deepEqual(odd.blocks.map((b) => b.id), ['ok', 'gone-day'])
assert.equal(odd.blocks[1].day, null) // 사라진 날의 블록은 보관함으로
assert.equal(odd.endHour, 30) // 최대 오전 6:00
assert.equal(odd.memo, '')

// 표 이름: 가장 큰 번호 + 1 (지운 번호는 다시 쓰지 않음)
assert.equal(nextSheetName([]), '표 1')
assert.equal(nextSheetName([{ name: '표 1' }, { name: '표 3' }]), '표 4')
assert.deepEqual(newSheet([{ name: '표 1' }], '2026-11-12', 'x'), { id: 'x', name: '표 2', plan: emptyPlan('2026-11-12') })

// 묶음 읽기: 깨진 표는 버리고, activeId가 없는 표면 첫 표
const book = { sheets: [{ id: 'a', name: '표 1', plan: sample }, { id: 'b', name: '표 2', plan: { 망가짐: 1 } }], activeId: 'b' }
assert.deepEqual(parseBook(JSON.stringify(book)), { sheets: [{ id: 'a', name: '표 1', plan: sample }], activeId: 'a' })
assert.equal(parseBook('{망가짐'), null)
assert.equal(parseBook(JSON.stringify({ sheets: [] })), null)

// 저장소 흉내
const fake = (init = {}) => {
  const mem = new Map(Object.entries(init))
  return { mem, getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) }
}

// 처음: 빈 '표 1'
assert.deepEqual(loadBook(fake(), '2026-11-12'), { sheets: [{ id: 'sheet-1', name: '표 1', plan: emptyPlan('2026-11-12') }], activeId: 'sheet-1' })

// 표가 하나뿐이던 때 저장한 일정은 '표 1'로 옮겨 오고, 저장하면 예전 자리는 지운다
const old = fake({ [OLD_KEY]: JSON.stringify(sample) })
const migrated = loadBook(old, '2026-11-12')
assert.deepEqual(migrated.sheets[0], { id: 'sheet-1', name: '표 1', plan: sample })
saveBook(old, migrated)
assert.equal(old.mem.has(OLD_KEY), false)
assert.deepEqual(loadBook(old, '2026-11-12'), migrated) // 저장 → 다시 읽기

// 저장소를 못 쓰는 환경에서도 멈추지 않는다
const broken = { getItem: () => { throw new Error('막힘') }, setItem: () => { throw new Error('막힘') }, removeItem: () => {} }
assert.equal(loadBook(broken, '2026-11-12').sheets.length, 1)
saveBook(broken, migrated)
assert.ok(BOOK_KEY)
console.log('ok')
