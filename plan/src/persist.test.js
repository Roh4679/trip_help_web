// 실행: node plan/src/persist.test.js — 자동 저장 읽기·쓰기
import assert from 'node:assert/strict'
import { parsePlan, loadPlan, savePlan, emptyPlan, STORAGE_KEY } from './persist.js'

// 기획서 4장 예시가 그대로 읽힌다
const sample = {
  startDate: '2026-04-08', days: 5, endHour: 25, memo: '숙소: 알레우 리조트',
  blocks: [
    { id: 'b1', title: '점심 먹기', color: 3, day: 1, start: 720, duration: 60 },
    { id: 'b2', title: '박물관', color: 5, day: null, start: null, duration: 90 },
  ],
}
assert.deepEqual(parsePlan(JSON.stringify(sample)), sample)

// 깨진 글자, 날짜 없음 → null
assert.equal(parsePlan('{망가짐'), null)
assert.equal(parsePlan(null), null)
assert.equal(parsePlan(JSON.stringify({ days: 3 })), null)

// 이상한 블록은 버리고, 범위 밖 값은 맞춘다
const odd = parsePlan(JSON.stringify({
  startDate: '2026-04-08', days: 2, endHour: 99,
  blocks: [
    { id: 'ok', title: 'A', color: 0, day: 1, start: 600, duration: 30 },
    { id: 'bad-color', title: 'B', color: 9, day: 1, start: 600, duration: 30 },
    { id: 'bad-dur', title: 'C', color: 0, day: 1, start: 600, duration: 45 },
    { id: 'gone-day', title: 'D', color: 0, day: 5, start: 600, duration: 60 },
  ],
}))
assert.deepEqual(odd.blocks.map((b) => b.id), ['ok', 'gone-day'])
assert.equal(odd.blocks[1].day, null) // 사라진 날의 블록은 보관함으로
assert.equal(odd.endHour, 30) // 최대 오전 6:00
assert.equal(odd.memo, '')

// 저장소 흉내: 저장 → 다시 읽기
const mem = new Map()
const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) }
assert.deepEqual(loadPlan(storage, '2026-11-12'), emptyPlan('2026-11-12')) // 처음엔 새 일정표
savePlan(storage, sample)
assert.ok(mem.has(STORAGE_KEY))
assert.deepEqual(loadPlan(storage, '2026-11-12'), sample)

// 저장소를 못 쓰는 환경에서도 멈추지 않는다
const broken = { getItem: () => { throw new Error('막힘') }, setItem: () => { throw new Error('막힘') } }
assert.deepEqual(loadPlan(broken, '2026-11-12'), emptyPlan('2026-11-12'))
savePlan(broken, sample)
console.log('ok')
