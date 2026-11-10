// 실행: node src/utils/format.test.js
import assert from 'node:assert'
import { flightText, timeDiffText, riskText, dangerText } from './format.js'

assert.equal(flightText({ direct: true, hours: 2.5 }), '직항 약 2시간 30분')
assert.equal(flightText({ direct: false, hours: 14, transitNote: '1회 경유' }), '직항 없음 · 최단 약 14시간 (1회 경유)')
assert.equal(timeDiffText(0, null), '한국과 시차 없음')
assert.equal(timeDiffText(-2, null), '한국보다 2시간 느림')
assert.equal(timeDiffText(-8, -7), '한국보다 8시간 느림 (서머타임 시 7시간 느림)')
assert.equal(timeDiffText(1, null), '한국보다 1시간 빠름')
assert.equal(riskText({ level: 1, label: '여행유의' }), '여행경보 1단계 여행유의')
assert.equal(riskText({ level: 0, label: '없음' }), '여행경보 없음')
assert.equal(dangerText({ level: 4 }), '여행경보 4단계 · 정보를 제공하지 않아요')
assert.equal(dangerText({ level: 2.5, special: true }), '특별여행주의보 · 정보를 제공하지 않아요')
assert.equal(dangerText({ blocked: true, message: '방문하려면 통일부 승인 필요' }), '방문하려면 통일부 승인 필요')
console.log('ok')
