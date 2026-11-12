// 실행: node plan/src/packing.test.js — 준비물 추가·고치기·삭제·순서 바꾸기·챙김
import assert from 'node:assert/strict'
import { charCount, clampText, addItem, renameItem, removeItem, toggleItem, moveItem, dropIndex } from './packing.js'
import { PACK_MAX_LEN } from './config.js'

// 글자 수: 한글·이모지도 한 글자
assert.equal(charCount('여권'), 2)
assert.equal(charCount('충전기🔌'), 4)
assert.equal(clampText('가'.repeat(25)).length, PACK_MAX_LEN) // 최대 글자 수까지만
assert.equal(clampText('충전기🔌🔌', 4), '충전기🔌') // 이모지를 반으로 자르지 않는다

// 추가: 앞뒤 빈칸 지움, 빈 글자는 안 넣음, 길면 잘림
let items = addItem([], '  여권 ', 'a')
assert.deepEqual(items, [{ id: 'a', text: '여권', packed: false }])
assert.equal(addItem(items, '   ', 'x'), items)
items = addItem(items, '충전기', 'b')
items = addItem(items, '선크림', 'c')
assert.equal(addItem([], 'ㄱ'.repeat(30), 'z')[0].text.length, PACK_MAX_LEN)

// 고치기 (빈 글자로는 안 바뀜)
assert.equal(renameItem(items, 'b', '보조배터리')[1].text, '보조배터리')
assert.equal(renameItem(items, 'b', '  ')[1].text, '충전기')

// 챙김 켜고 끄기
const packed = toggleItem(items, 'a')
assert.equal(packed[0].packed, true)
assert.equal(toggleItem(packed, 'a')[0].packed, false)
assert.equal(items[0].packed, false) // 입력 배열은 그대로

// 삭제
assert.deepEqual(removeItem(items, 'b').map((it) => it.id), ['a', 'c'])

// 순서 바꾸기: 뺀 뒤 목록 기준 자리에 넣는다
const ids = (list) => list.map((it) => it.id)
assert.deepEqual(ids(moveItem(items, 'a', 2)), ['b', 'c', 'a']) // 맨 뒤로
assert.deepEqual(ids(moveItem(items, 'c', 0)), ['c', 'a', 'b']) // 맨 앞으로
assert.deepEqual(ids(moveItem(items, 'a', 1)), ['b', 'a', 'c'])
assert.deepEqual(ids(moveItem(items, 'b', 99)), ['a', 'c', 'b']) // 범위 밖은 끝으로
assert.deepEqual(ids(moveItem(items, '없음', 0)), ['a', 'b', 'c'])
// 놓을 자리: 두 줄로 줄바꿈된 블록들 (윗줄 0·1, 아랫줄 2)
const R = (left, top, w = 60) => ({ left, top, right: left + w, bottom: top + 30 })
const rects = [R(0, 0), R(70, 0), R(0, 40)]
assert.equal(dropIndex(rects, 10, 15), 0) // 첫 블록 왼쪽 절반
assert.equal(dropIndex(rects, 50, 15), 1) // 첫 블록 오른쪽 절반 → 두 번째 앞
assert.equal(dropIndex(rects, 200, 15), 2) // 윗줄 끝 너머 → 아랫줄 첫 블록 앞
assert.equal(dropIndex(rects, 5, 55), 2) // 아랫줄 첫 블록 왼쪽
assert.equal(dropIndex(rects, 200, 55), 3) // 맨 끝
assert.equal(dropIndex(rects, 200, 35), 2) // 줄 사이 틈은 아랫줄 앞
assert.equal(dropIndex([], 0, 0), 0)
console.log('ok')
