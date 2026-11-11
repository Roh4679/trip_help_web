// npm run check-risk 에서 쓰는 순수 함수: 0404 나라별 페이지 HTML → 단계 범위, 데이터와 비교

const TAG_LEVEL = { t01: 1, t02: 2, t03: 3, t04: 4, t05: 2.5 } // t05 = 특별여행주의보
const ENTITIES = { '&middot;': '·', '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"' }
const decode = (s) => s.replace(/&[a-z]+;/g, (e) => ENTITIES[e] ?? e)

// 페이지의 여행경보 목록 → [{ level, area }]. 주석(<!-- -->) 안의 예시 항목은 뺀다
export function parseSafetyPage(html) {
  const body = html.replace(/<!--[\s\S]*?-->/g, '')
  const list = body.match(/<ul class="info-02">([\s\S]*?)<\/ul>/)?.[1] ?? ''
  return [...list.matchAll(/<span class="box-tag-01 (t\d+)">[^<]*<\/span>([^<]*)/g)].map(([, tag, area]) => ({ level: TAG_LEVEL[tag], area: decode(area).trim() }))
}

// 단계 목록 → [최소, 최대]. "전 지역", "~을 제외한 지역", "~ 이외 지역"이 없으면 나머지 지역은 경보 없음(0)
export function pageRange(items) {
  const levels = items.map((i) => i.level)
  if (!items.some((i) => /전\s*지역|제외|이외|외 전/.test(i.area))) levels.push(0)
  return [Math.min(...levels), Math.max(...levels)]
}

export function dataRange(risk) {
  return risk.mixed ? risk.range : [risk.level, risk.level]
}

const levelName = (n) => (n === 0 ? '없음' : n % 1 ? '특별여행주의보' : `${n}단계`)
export function rangeText([a, b]) {
  return a === b ? levelName(a) : `${levelName(a)}~${levelName(b)}`
}

export function sameRange(a, b) {
  return a[0] === b[0] && a[1] === b[1]
}
