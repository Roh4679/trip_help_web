// 실행: node src/utils/recommend.test.js
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { recommend } from './recommend.js'

// 데이터가 늘어도 시험이 흔들리지 않게 처음 세 나라만 쓴다
const countries = JSON.parse(readFileSync(new URL('../data/countries.json', import.meta.url))).filter((c) => ['jp', 'th', 'fr'].includes(c.iso2))
const names = (opts) => recommend(countries, { maxHours: 20, seasons: [], avoidRain: false, moods: [], ...opts }).map((r) => r.country.name)

assert.deepEqual(names({}), ['일본', '태국', '프랑스']) // 조건 없으면 비행시간 짧은 순
assert.deepEqual(names({ maxHours: 6 }), ['일본', '태국'])
assert.deepEqual(names({ seasons: ['여름'], avoidRain: true }), ['프랑스']) // 일본 6·7월, 태국 6~8월 우기
assert.deepEqual(names({ seasons: ['겨울'], avoidRain: true }), ['일본', '태국', '프랑스'])
assert.deepEqual(names({ moods: ['로맨스', '건축양식'] }), ['프랑스'])
assert.deepEqual(names({ moods: ['전통', '휴양'] }), ['태국', '일본']) // 태국 2개 일치 > 일본 1개
assert.deepEqual(names({ moods: ['전통'], maxHours: 3 }), ['일본'])
assert.equal(recommend(countries, { maxHours: 20, seasons: ['겨울'], avoidRain: false, moods: [] })[0].avgTemp, 6.4) // 도쿄 12·1·2월
assert.deepEqual(names({ maxHours: 1 }), [])
// 위험 국가 제외
assert.deepEqual(recommend([{ ...countries[0], risk: { level: 3 } }], { maxHours: 20, seasons: [], avoidRain: false, moods: [] }), [])
assert.deepEqual(recommend([{ ...countries[0], risk: { level: 2.5, special: true } }], { maxHours: 20, seasons: [], avoidRain: false, moods: [] }), [])
console.log('ok')
