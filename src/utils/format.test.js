// 실행: node src/utils/format.test.js
import assert from 'node:assert'
import { flightText, timeDiffText, riskText } from './format.js'

assert.equal(flightText({ direct: true, hours: 2.5 }), '직항 약 2시간 30분')
assert.equal(flightText({ direct: false, hours: 14, transitNote: '1회 경유' }), '직항 없음 · 최단 약 14시간 (1회 경유)')
assert.equal(timeDiffText(0, null), '한국과 시차 없음')
assert.equal(timeDiffText(-2, null), '한국보다 2시간 느림')
assert.equal(timeDiffText(-8, -7), '한국보다 8시간 느림 (서머타임 시 7시간 느림)')
assert.equal(timeDiffText(1, null), '한국보다 1시간 빠름')
assert.equal(riskText({ level: 1, label: '여행유의', updated: '미확인' }), '여행경보 1단계 여행유의 · 날짜 미확인')
assert.equal(riskText({ level: 0, label: '없음', updated: '2026-11-01' }), '여행경보 없음 · 2026-11-01 기준')
console.log('ok')
