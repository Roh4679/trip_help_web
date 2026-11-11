import assert from 'node:assert/strict'
import { parseRates, krwFor, timeText, rateView } from './rates.js'

const ok = parseRates({ result: 'success', time_last_update_unix: 1794355352, rates: { KRW: 1, USD: 1 / 1400, JPY: 0.11 } })
assert.equal(ok.time, 1794355352000)
assert.throws(() => parseRates({ result: 'error', 'error-type': 'unsupported-code' }), /unsupported-code/)
assert.throws(() => parseRates(null))

assert.equal(krwFor(1, 'USD', ok.rates), 1400)
assert.equal(krwFor(100, 'JPY', ok.rates), 909)
assert.equal(krwFor(1, 'XXX', ok.rates), null)
assert.equal(krwFor(1, 'USD', null), null)

assert.equal(timeText(1794355352000), '2026-11-11 09:02') // UTC 00:02 → 한국 09:02
assert.equal(timeText('2026-11-11T00:02:32.000Z'), '2026-11-11 09:02')
assert.equal(timeText('미확인'), null)
console.log('rates ok')

const usd = { unit: 1, code: 'USD', krw: 1350, updated: '2026-11-10T00:00:00.000Z' }
assert.deepEqual(rateView(usd, { ...ok, fresh: true }), { krw: 1400, note: '2026-11-11 09:02 기준' })
assert.deepEqual(rateView(usd, { ...ok, fresh: false }), { krw: 1400, note: '마지막 갱신: 2026-11-11 09:02' })
assert.deepEqual(rateView(usd, null), { krw: 1350, note: '마지막 갱신: 2026-11-10 09:00' })
assert.deepEqual(rateView({ ...usd, code: 'XXX' }, { ...ok, fresh: true }), { krw: 1350, note: '마지막 갱신: 2026-11-10 09:00' })
assert.equal(rateView({ ...usd, updated: '미확인' }, null).note, null)
console.log('rateView ok')
