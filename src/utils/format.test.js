// 실행: node src/utils/format.test.js
import assert from 'node:assert'
import { flightText, timeDiffText, riskText, dangerText, safetyUrl } from './format.js'

assert.equal(riskText({ level: 2, label: '여행자제' }), '여행경보 2단계 여행자제')
assert.equal(riskText({ level: 0, label: '없음' }), '여행경보 없음')
assert.equal(riskText({ level: 2.5, label: '특별여행주의보', special: true }), '특별여행주의보')
assert.equal(riskText({ level: 2, mixed: true, range: [1, 4] }), '지역별 상이 (1~4단계)')
assert.equal(riskText({ level: 0, mixed: true, range: [0, 3] }), '지역별 상이 (없음~3단계)')
assert.equal(riskText({ level: 1, mixed: true, range: [1, 2.5] }), '지역별 상이 (1단계~특별여행주의보)')
assert.equal(safetyUrl({ safetyId: '252' }), 'https://www.0404.go.kr/ntnSafetyInfo/252/detail')
assert.equal(safetyUrl({}), 'https://www.0404.go.kr/')

assert.equal(flightText({ direct: true, hours: 2.5 }), '직항 약 2시간 30분')
assert.equal(flightText({ direct: true, hours: 12, transitNote: '여름 시간표 기준' }), '직항 약 12시간 (여름 시간표 기준)')
assert.equal(flightText({ direct: false, hours: 14, transitNote: '1회 경유' }), '직항 없음 · 최단 약 14시간 (1회 경유)')
assert.equal(timeDiffText(0, null), '한국과 시차 없음')
assert.equal(timeDiffText(-2, null), '한국보다 2시간 느림')
assert.equal(timeDiffText(-8, -7), '한국보다 8시간 느림 (서머타임 시 7시간 느림)')
assert.equal(timeDiffText(1, null), '한국보다 1시간 빠름')
assert.equal(timeDiffText(-3.5, null), '한국보다 3시간 30분 느림')
assert.equal(timeDiffText(-3.25, null), '한국보다 3시간 15분 느림')
assert.equal(riskText({ level: 1, label: '여행유의' }), '여행경보 1단계 여행유의')
assert.equal(riskText({ level: 0, label: '없음' }), '여행경보 없음')
assert.equal(dangerText({ level: 4 }), '여행경보 4단계 · 정보를 제공하지 않아요')
assert.equal(dangerText({ level: 2.5, special: true }), '특별여행주의보 · 정보를 제공하지 않아요')
assert.equal(dangerText({ blocked: true, message: '방문하려면 통일부 승인 필요' }), '방문하려면 통일부 승인 필요')
console.log('ok')
