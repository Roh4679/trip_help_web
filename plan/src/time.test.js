// 실행: node plan/src/time.test.js
import assert from 'node:assert/strict'
import { timeLabel, slots, dayLabel, todayISO, durationLabel } from './time.js'

assert.equal(timeLabel(360), '6:00')
assert.equal(timeLabel(630), '10:30')
assert.equal(timeLabel(1440), '0:00') // 자정 이후는 0:00
assert.equal(timeLabel(1500), '1:00')
assert.equal(timeLabel(1800), '6:00') // 다음 날 오전 6시 (최대 끝)

const s = slots(25) // 6:00 ~ 새벽 1:00
assert.equal(s[0], 360)
assert.equal(s.at(-1), 1470) // 마지막 칸 0:30~1:00
assert.equal(s.length, 38) // 19시간 × 2
assert.equal(slots(30).length, 48) // 하루 24시간

assert.deepEqual(dayLabel('2026-04-08', 0), { title: '1일차', date: '4월 8일 (수)' })
assert.deepEqual(dayLabel('2026-04-30', 1), { title: '2일차', date: '5월 1일 (금)' }) // 달 넘어감
assert.deepEqual(dayLabel('2026-12-31', 1), { title: '2일차', date: '1월 1일 (금)' }) // 해 넘어감

assert.equal(todayISO(new Date(2026, 10, 12)), '2026-11-12')
assert.equal(durationLabel(60), '1시간')
assert.equal(durationLabel(30), '30분')
assert.equal(durationLabel(90), '1시간 30분')
console.log('ok')
