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
]
const items = buildSearchItems(places)
const find = (q) => items.filter((it) => matches(it, q)).map((it) => it.label)

assert.equal(items.filter((it) => it.label === '우크라이나').length, 1) // 같은 나라는 한 줄
assert.deepEqual(find('태'), ['태국']) // 한글 일부
assert.deepEqual(find('japan'), ['일본']) // 영어
assert.deepEqual(find('JAP'), ['일본']) // 대소문자 무시
assert.deepEqual(find('터키'), ['튀르키예']) // 다른 이름
assert.deepEqual(find('turkey'), ['튀르키예'])
assert.deepEqual(find('싱가폴'), ['싱가포르']) // aliases.json
assert.deepEqual(find('singapore'), ['싱가포르']) // iso2로 영어 이름
assert.deepEqual(items.map((it) => it.label).slice(-2), ['몽골', '우크라이나']) // 볼 수 있음 → 준비 중 → 위험 순
console.log('ok')
