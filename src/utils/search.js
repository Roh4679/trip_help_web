import { allNames } from './countryName.js'
import aliases from '../data/aliases.json' with { type: 'json' }

export const STATUS_LABEL = { ok: '볼 수 있음', none: '준비 중', danger: '위험', home: '출발지' }
const STATUS_ORDER = { ok: 0, home: 1, none: 2, danger: 3 }

// 검색 목록: 장소마다 한 줄 (크림반도처럼 같은 나라가 두 모양이면 하나만). 볼 수 있는 나라가 먼저, 그다음 가나다순
export function buildSearchItems(places) {
  const seen = new Set()
  return places
    .filter((p) => {
      const k = p.id ?? p.name
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .map((p) => ({
      id: p.key,
      label: p.name,
      auxiliaryData: {
        place: p,
        // 한국어 이름 일부, 영어 이름, 다른 이름(터키 → 튀르키예 등)으로도 찾을 수 있게
        keywords: [...allNames(p.id), p.englishName, ...(aliases[p.id] ?? [])].filter(Boolean),
      },
    }))
    .sort((a, b) => STATUS_ORDER[a.auxiliaryData.place.status] - STATUS_ORDER[b.auxiliaryData.place.status] || a.label.localeCompare(b.label, 'ko'))
}

// Astryx createStaticSource와 같은 규칙 (대소문자 무시, 이름이나 다른 이름에 글자가 들어 있으면)
export function matches(item, query) {
  const q = query.toLowerCase().trim()
  return [item.label, ...item.auxiliaryData.keywords].some((t) => t.toLowerCase().includes(q))
}
