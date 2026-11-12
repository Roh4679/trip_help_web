// 실행: node src/utils/search.test.js
import assert from 'node:assert'
import { buildSearchItems, matches } from './search.js'

const places = [
  { key: 'a', id: '792', name: '튀르키예', englishName: 'Turkey', status: 'ok' },
  { key: 'b', id: '392', name: '일본', englishName: 'Japan', status: 'ok' },
  { key: 'c', id: '764', name: '태국', englishName: 'Thailand', status: 'ok' },
  { key: 'd', id: 'sg', name: '싱가포르', status: 'ok' },
  { key: 'e', id: '804', name: '우크라이나', englishName: 'Ukraine', status: 'danger' },
  { key: 'f', id: '804', name: '우크라이나', englishName: 'Ukraine', status: 'danger' }, // 크림반도 조각
  { key: 'g', id: '496', name: '몽골', englishName: 'Mongolia', status: 'none' },
  { key: 'h', id: '784', name: '아랍에미리트', englishName: 'United Arab Emirates', status: 'ok', data: { climateCity: '두바이' } },
  { key: 'i', id: '704', name: '베트남', englishName: 'Vietnam', status: 'ok', data: { climateCity: '하노이' } },
  { key: 'j', id: '608', name: '필리핀', englishName: 'Philippines', status: 'ok', data: { climateCity: '마닐라' } },
  { key: 'k', id: '484', name: '멕시코', englishName: 'Mexico', status: 'ok', data: { climateCity: '칸쿤' } },
  { key: 'l', id: 'sg', name: '싱가포르', status: 'ok', data: { climateCity: '싱가포르' } },
]
const items = buildSearchItems(places)
// 도시는 "두바이 → 아랍에미리트"처럼 가는 나라와 같이
const find = (q) => items.filter((it) => matches(it, q)).map((it) => (it.auxiliaryData.country ? `${it.label} → ${it.auxiliaryData.country}` : it.label))

assert.equal(items.filter((it) => it.label === '우크라이나').length, 1) // 같은 나라는 한 줄
assert.deepEqual(find('태'), ['태국']) // 한글 일부
assert.deepEqual(find('japan'), ['일본']) // 영어
assert.deepEqual(find('JAP'), ['일본']) // 대소문자 무시
assert.deepEqual(find('터키'), ['튀르키예']) // 다른 이름
assert.deepEqual(find('turkey'), ['튀르키예'])
assert.deepEqual(find('싱가폴'), ['싱가포르']) // aliases.json
assert.deepEqual(find('singapore'), ['싱가포르']) // iso2로 영어 이름
const countryLabels = items.filter((it) => !it.auxiliaryData.country).map((it) => it.label)
assert.deepEqual(countryLabels.slice(-2), ['몽골', '우크라이나']) // 볼 수 있음 → 준비 중 → 위험 순

// 도시 이름으로 찾기
assert.deepEqual(find('두바이'), ['두바이 → 아랍에미리트']) // climateCity + aliases (중복은 한 줄)
assert.deepEqual(find('다낭'), ['다낭 → 베트남'])
assert.deepEqual(find('세부'), ['세부 → 필리핀'])
assert.deepEqual(find('칸쿤'), ['칸쿤 → 멕시코'])
assert.deepEqual(find('아부'), ['아부다비 → 아랍에미리트'])
assert.deepEqual(find('UAE'), ['아랍에미리트']) // 다른 이름
assert.deepEqual(find('베트남'), ['베트남']) // 나라 이름으로는 도시가 같이 나오지 않는다
assert.equal(items.filter((it) => it.label === '싱가포르').length, 1) // 나라 이름과 같은 기후 도시는 빼서 한 줄
assert.equal(items.findIndex((it) => it.auxiliaryData.country) > countryLabels.length - 1, true) // 나라가 먼저, 도시는 뒤
console.log('ok')
