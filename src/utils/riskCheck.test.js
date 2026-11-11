// 실행: node src/utils/riskCheck.test.js
import assert from 'node:assert/strict'
import { parseSafetyPage, pageRange, dataRange, rangeText, sameRange } from './riskCheck.js'

const li = (tag, label, area) => `<li><span class="box-tag-01 ${tag}">${label}</span>${area}</li>`
const page = (...items) => `<h4>x</h4><ul class="info-02">${items.join('')}<!-- ${li('t04', '여행금지', '가자지구')} --></ul>`

// 태국: 1단계(나머지 전부) + 2 + 3
const th = parseSafetyPage(page(li('t01', '여행유의', '2.3단계 및 특별여행주의보 발령 지역을 제외한 지역'), li('t02', '여행자제', '딱 주'), li('t03', '출국권고', '얄라 주')))
assert.deepEqual(th.map((i) => i.level), [1, 2, 3]) // 주석 안의 여행금지는 빠진다
assert.deepEqual(pageRange(th), [1, 3])
// 일본: 3단계 지역만 있고 나머지는 경보 없음
assert.deepEqual(pageRange(parseSafetyPage(page(li('t03', '출국권고', '후쿠시마 원전 반경 30km 이내')))), [0, 3])
// 모로코: "이외 지역"도 나머지 전부
assert.deepEqual(pageRange(parseSafetyPage(page(li('t01', '여행유의', '서사하라 이외 지역'), li('t03', '출국권고', '모래방어벽 동쪽')))), [1, 3])
// HTML 기호는 글자로
assert.equal(parseSafetyPage(page(li('t04', '여행금지', '로스토프&middot;벨고로드')))[0].area, '로스토프·벨고로드')
// 경보 없는 나라
assert.deepEqual(pageRange(parseSafetyPage(page())), [0, 0])
// 전 지역 한 단계
assert.deepEqual(pageRange(parseSafetyPage(page(li('t02', '여행자제', '전 지역')))), [2, 2])
// 특별여행주의보 = 2.5
assert.deepEqual(pageRange(parseSafetyPage(page(li('t01', '여행유의', '특별여행주의보를 제외한 전 지역'), li('t05', '특별여행주의보', '바그마티 주')))), [1, 2.5])

assert.deepEqual(dataRange({ level: 2, mixed: true, range: [1, 4] }), [1, 4])
assert.deepEqual(dataRange({ level: 1 }), [1, 1])
assert.equal(rangeText([0, 0]), '없음')
assert.equal(rangeText([1, 2.5]), '1단계~특별여행주의보')
assert.equal(sameRange([1, 3], [1, 3]), true)
assert.equal(sameRange([1, 1], [1, 3]), false)
console.log('ok')
