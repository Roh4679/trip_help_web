// 실행: node plan/src/schedule.test.js — 밀어내기 규칙 (PLANNER_plan.md 3.6)
import assert from 'node:assert/strict'
import { snap, placeBlock, resizeBlock, storeBlock, changeDays } from './schedule.js'

const H = (h, m = 0) => h * 60 + m // 시각 → 분
const blk = (id, day, start, duration) => ({ id, title: id, color: 0, day, start, duration })
const at = (r) => Object.fromEntries(r.blocks.map((b) => [b.id, b.day == null ? null : [b.day, b.start, b.start + b.duration]]))

assert.equal(snap(H(10, 14)), H(10))
assert.equal(snap(H(10, 16)), H(10, 30))

// 기획서 예: A 10~11, B 11~12, C 12:30~13:30 에서 A를 11:30까지 늘리면 B만 11:30~12:30, C는 그대로
const ex = [blk('A', 1, H(10), 60), blk('B', 1, H(11), 60), blk('C', 1, H(12, 30), 60)]
let r = resizeBlock(ex, 'A', 90, 25)
assert.deepEqual(at(r), { A: [1, H(10), H(11, 30)], B: [1, H(11, 30), H(12, 30)], C: [1, H(12, 30), H(13, 30)] })
assert.deepEqual(r.stored, [])
assert.equal(ex[1].start, H(11)) // 입력 배열은 그대로

// 연쇄 밀림: A를 12:00까지 늘리면 B 12~13, C 13~14
r = resizeBlock(ex, 'A', 120, 25)
assert.deepEqual(at(r), { A: [1, H(10), H(12)], B: [1, H(12), H(13)], C: [1, H(13), H(14)] })

// 줄이면 아래 블록은 당겨지지 않는다, 최소 30분
r = resizeBlock(ex, 'A', 0, 25)
assert.deepEqual(at(r), { A: [1, H(10), H(10, 30)], B: [1, H(11), H(12)], C: [1, H(12, 30), H(13, 30)] })

// 끼워 넣기: 보관함 N(1시간)을 11:00에 놓으면 B 12~13, C 13~14, 위의 A는 그대로
const withN = [...ex, blk('N', null, null, 60)]
r = placeBlock(withN, 'N', 1, H(11), 25)
assert.deepEqual(at(r), { A: [1, H(10), H(11)], B: [1, H(12), H(13)], C: [1, H(13), H(14)], N: [1, H(11), H(12)] })

// 중간에 놓기: N을 10:30(A의 중간)에 놓으면 A는 N이 끝나는 11:30으로, B·C도 연쇄로
r = placeBlock(withN, 'N', 1, H(10, 30), 25)
assert.deepEqual(at(r), { A: [1, H(11, 30), H(12, 30)], B: [1, H(12, 30), H(13, 30)], C: [1, H(13, 30), H(14, 30)], N: [1, H(10, 30), H(11, 30)] })

// 빈 시간에 놓으면 아무것도 안 밀린다, 다른 날 블록은 상관없음
r = placeBlock([...withN, blk('D', 2, H(9), 60)], 'N', 1, H(14), 25)
assert.deepEqual(at(r), { A: [1, H(10), H(11)], B: [1, H(11), H(12)], C: [1, H(12, 30), H(13, 30)], D: [2, H(9), H(10)], N: [1, H(14), H(15)] })

// 놓은 시각은 30분 칸에 맞춰진다
r = placeBlock(withN, 'N', 2, H(9, 10), 25)
assert.deepEqual(at(r).N, [2, H(9), H(10)])

// 표 끝을 넘으면 끝 시간을 늘린다: 0:00~1:00 블록 아래로 밀리면 끝이 26(새벽 2시)
const late = [blk('L', 1, H(24), 60), blk('M', null, null, 60)]
r = placeBlock(late, 'M', 1, H(24), 25)
assert.deepEqual(at(r), { L: [1, H(25), H(26)], M: [1, H(24), H(25)] })
assert.equal(r.endHour, 26)

// 최대(오전 6:00 = 30시)를 넘으면 그 블록은 보관함으로
const full = [blk('X', 1, H(29), 60), blk('Y', null, null, 60)]
r = placeBlock(full, 'Y', 1, H(29), 25)
assert.deepEqual(at(r), { X: null, Y: [1, H(29), H(30)] })
assert.deepEqual(r.stored, ['X'])
assert.equal(r.endHour, 30)

// 표 끝보다 늦게 놓으려 하면 하루 안으로 당겨 놓는다
r = placeBlock([blk('Z', null, null, 90)], 'Z', 1, H(30), 25)
assert.deepEqual(at(r).Z, [1, H(28, 30), H(30)])

// 보관함으로 빼기: 아래 블록은 당겨지지 않는다
assert.deepEqual(at({ blocks: storeBlock(ex, 'A') }), { A: null, B: [1, H(11), H(12)], C: [1, H(12, 30), H(13, 30)] })

// 날짜 줄이기: 사라지는 날의 블록은 보관함으로
const r2 = changeDays([blk('A', 1, H(10), 60), blk('B', 3, H(10), 60)], 2)
assert.deepEqual(r2.stored, ['B'])
assert.equal(r2.blocks[1].day, null)
console.log('ok')
