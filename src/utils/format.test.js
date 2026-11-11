// 실행: node src/utils/format.test.js
import assert from 'node:assert'
import { flightText, timeDiffText, riskText, dangerText, safetyUrl, warningText, placeNotice } from './format.js'

// 상세 창 대신 보여 줄 안내
const RU = { level: 2.5, label: '특별여행주의보', special: true, blocked: true, safetyId: '39' }
assert.deepEqual(placeNotice({ status: 'danger', data: { risk: RU } }), { detail: '특별여행주의보 · 정보를 제공하지 않아요 ↗', url: 'https://www.0404.go.kr/ntnSafetyInfo/39/detail' })
assert.deepEqual(placeNotice({ status: 'danger', data: { risk: { level: null, blocked: true, message: '방문하려면 통일부 승인 필요' } } }), { detail: '방문하려면 통일부 승인 필요 ↗', url: 'https://www.0404.go.kr/' }) // 북한
assert.deepEqual(placeNotice({ status: 'danger', data: { risk: { level: 4, label: '여행금지', safetyId: '169' } } }).detail, '여행경보 4단계 · 정보를 제공하지 않아요 ↗')
assert.deepEqual(placeNotice({ status: 'none', data: { risk: { level: 1, label: '여행유의', safetyId: '1' } } }), { detail: '여행경보 1단계 여행유의 ↗ · 상세 정보는 곧 추가될 예정이에요', url: 'https://www.0404.go.kr/ntnSafetyInfo/1/detail' }) // 여행경보만 있는 나라
assert.deepEqual(placeNotice({ status: 'none', data: { risk: { level: 2.5, label: '특별여행주의보', special: true } } }).detail, '특별여행주의보 ↗ · 상세 정보는 곧 추가될 예정이에요')
assert.deepEqual(placeNotice({ status: 'none', data: undefined }), { detail: '곧 추가될 예정이에요~' })
assert.deepEqual(placeNotice({ status: 'home' }), { detail: '출발지예요' })
assert.equal(placeNotice({ status: 'ok', data: { risk: {} } }), null)

assert.equal(warningText({ level: 3, label: '출국권고' }), '⚠ 여행경보 3단계(출국권고)')
assert.equal(warningText({ level: 2.5, label: '특별여행주의보', special: true, mixed: true }), '⚠ 특별여행주의보 · 주요 관광지 기준')

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
