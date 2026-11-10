// 실행: node src/utils/countryStatus.test.js
import assert from 'node:assert'
import { countryStatus } from './countryStatus.js'

assert.equal(countryStatus(undefined), 'none')
assert.equal(countryStatus({ risk: { level: 1 }, climate: [] }), 'ok')
assert.equal(countryStatus({ risk: { level: 3 }, climate: [] }), 'danger')
assert.equal(countryStatus({ risk: { level: 4 } }), 'danger') // 데이터 없어도 위험이 우선
console.log('ok')
