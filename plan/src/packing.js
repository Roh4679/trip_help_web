// 준비물 목록 계산 (메모 아래 "준비물" 칸). 밀어내기 함수처럼 화면과 분리한 순수 함수: 입력 배열을 고치지 않고 새 배열을 돌려준다
// 준비물: { id, text, packed } — packed가 true면 챙긴 것
import { PACK_MAX_LEN } from './config.js'

// 글자 수 (이모지 같은 글자도 한 글자로)
export const charCount = (text) => Array.from(text).length

// 최대 글자 수까지만 남긴다 (넘으면 더 입력되지 않게)
export const clampText = (text, max = PACK_MAX_LEN) => Array.from(text).slice(0, max).join('')

// 끝에 추가. 앞뒤 빈칸은 지우고, 비어 있으면 그대로
export function addItem(items, text, id = crypto.randomUUID()) {
  const t = clampText(text.trim())
  return t ? [...items, { id, text: t, packed: false }] : items
}

export function renameItem(items, id, text) {
  const t = clampText(text.trim())
  return t ? items.map((it) => (it.id === id ? { ...it, text: t } : it)) : items
}

export function removeItem(items, id) {
  return items.filter((it) => it.id !== id)
}

// 챙김 표시를 켜고 끈다
export function toggleItem(items, id) {
  return items.map((it) => (it.id === id ? { ...it, packed: !it.packed } : it))
}

// 순서 바꾸기: id인 준비물을 빼서 index 자리(뺀 뒤 목록 기준)에 넣는다
export function moveItem(items, id, index) {
  const from = items.findIndex((it) => it.id === id)
  if (from < 0) return items
  const rest = items.filter((it) => it.id !== id)
  const to = Math.max(0, Math.min(index, rest.length))
  return [...rest.slice(0, to), items[from], ...rest.slice(to)]
}

// 끌어서 놓을 자리: 다른 준비물들의 화면 위치(읽는 순서, { left, top, right, bottom })와 커서 위치 → 넣을 자리(0~개수)
// 커서보다 "뒤에" 오는 첫 블록 앞에 넣는다: 그 블록 줄보다 위에 있거나, 같은 줄에서 블록 가운데보다 왼쪽이면
// 줄바꿈된 목록에서도 자연스럽게 동작한다
export function dropIndex(rects, x, y) {
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i]
    if (y < r.top) return i
    if (y <= r.bottom && x < (r.left + r.right) / 2) return i
  }
  return rects.length
}
