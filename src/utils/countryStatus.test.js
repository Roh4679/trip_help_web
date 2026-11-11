// 실행: node src/utils/countryStatus.test.js
import assert from 'node:assert'
import { countryStatus, riskTone } from './countryStatus.js'

assert.equal(countryStatus(undefined), 'none')
assert.equal(countryStatus({ risk: { level: 1 }, climate: [] }), 'ok')
assert.equal(countryStatus({ risk: { level: 3 }, climate: [] }), 'ok') // 3단계까지는 정보 제공 (RISK_LEVEL_BLOCK=4)
assert.equal(countryStatus({ risk: { level: 4 } }), 'danger') // 데이터 없어도 위험이 우선
assert.equal(countryStatus({ risk: { level: 2.5, special: true } }), 'none') // 특별여행주의보도 정보 제공, 데이터 없으면 준비 중
assert.equal(countryStatus({ risk: { level: 4 }, climate: [] }), 'danger')
assert.equal(countryStatus({ risk: { level: 2 }, climate: [] }), 'ok')
assert.equal(countryStatus({ risk: { blocked: true } }), 'danger') // 북한
assert.equal(riskTone({ risk: { level: 0 }, climate: [] }), 0)
assert.equal(riskTone({ risk: { level: 1 }, climate: [] }), 1)
assert.equal(riskTone({ risk: { level: 2, mixed: true, range: [1, 4] }, climate: [] }), 2) // 지역별 상이: 주요 관광지 기준 level
assert.equal(riskTone({ risk: { level: 2.5, special: true } }), 3) // 특별여행주의보: 데이터 없어도 경고 색 (러시아)
assert.equal(riskTone({ risk: { level: 2.5, special: true }, climate: [] }), 3)
assert.equal(riskTone({ risk: { level: 3 }, climate: [] }), 3)
assert.equal(riskTone({ risk: { level: 4 } }), 4)
assert.equal(riskTone({ risk: { level: null, blocked: true } }), 4) // 북한
assert.equal(riskTone({ risk: { level: 1 } }), 'none') // 데이터 없음
console.log('ok')
