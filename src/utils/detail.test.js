// 실행: node src/utils/detail.test.js
import assert from 'node:assert'
import { isRainy, tempColor } from './climate.js'
import { clothing } from './clothing.js'
import { needsAdapter, adapterText, voltageText } from './plug.js'

assert.equal(isRainy({ rain: 150, rainy: false }), true)
assert.equal(isRainy({ rain: 149, rainy: false }), false)
assert.equal(isRainy({ rain: 10, rainy: true }), true)
assert.equal(tempColor(-20), 'rgb(33, 102, 172)')
assert.equal(tempColor(15), 'rgb(255, 250, 225)')
assert.equal(tempColor(40), 'rgb(178, 24, 43)')

assert.equal(clothing(30, false)[0], '민소매')
assert.equal(clothing(28, false)[0], '민소매')
assert.equal(clothing(27.9, false)[0], '반팔')
assert.equal(clothing(4.5, false)[0], '패딩')
assert.equal(clothing(-5, true).at(-1), '우산 또는 방수 자켓')

assert.equal(needsAdapter({ types: ['A', 'B'], voltage: 100 }), true) // 일본
assert.equal(needsAdapter({ types: ['A', 'B', 'C', 'O'], voltage: 230 }), false) // 태국
assert.equal(needsAdapter({ types: ['C', 'E'], voltage: 230 }), false) // 프랑스
assert.equal(needsAdapter({ types: ['C'], voltage: 110 }), true)

assert.equal(adapterText({ types: ['A', 'B'], voltage: 100 }), '변환 어댑터 필요 · 납작한 11자 모양 콘센트예요')
assert.equal(adapterText({ types: ['G'], voltage: 230 }), '변환 어댑터 필요 · 영국식 3구 콘센트예요')
assert.equal(adapterText({ types: ['C', 'E'], voltage: 230 }), '어댑터 필요 없음')
assert.equal(adapterText({ types: ['Z'], voltage: 230 }), '변환 어댑터 필요 · 한국과 다른 모양 콘센트예요')
assert.equal(voltageText({ voltage: 230 }), null)
assert.match(voltageText({ voltage: 100 }), /100V/)
console.log('ok')
