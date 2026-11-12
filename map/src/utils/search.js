import { allNames } from './countryName.js'
import aliases from '../data/aliases.json' with { type: 'json' }

export const STATUS_LABEL = { ok: '볼 수 있음', none: '준비 중', danger: '위험', home: '출발지' }
const STATUS_ORDER = { ok: 0, home: 1, none: 2, danger: 3 }

const byStatusThenName = (a, b) =>
  STATUS_ORDER[a.auxiliaryData.place.status] - STATUS_ORDER[b.auxiliaryData.place.status] || a.label.localeCompare(b.label, 'ko')

// 그 나라로 가는 도시: 기후 기준 도시(climateCity) + aliases.json cities. 나라 이름과 같으면(싱가포르 등) 뺀다
export function citiesOf(place) {
  return [...new Set([place.data?.climateCity, ...(aliases.cities[place.id] ?? [])])].filter((c) => c && c !== place.name)
}

// 검색 목록: 나라마다 한 줄 (크림반도처럼 같은 나라가 두 모양이면 하나만) + 도시마다 한 줄 (auxiliaryData.country = 가는 나라)
// 나라가 먼저, 그다음 도시. 각각 볼 수 있는 곳 먼저, 그다음 가나다순
export function buildSearchItems(places) {
  const seen = new Set()
  const unique = places.filter((p) => {
    const k = p.id ?? p.name
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  const countries = unique.map((p) => ({
    id: p.key,
    label: p.name,
    auxiliaryData: {
      place: p,
      // 한국어 이름 일부, 영어 이름, 다른 이름(터키 → 튀르키예 등)으로도 찾을 수 있게
      keywords: [...allNames(p.id), p.englishName, ...(aliases.names[p.id] ?? [])].filter(Boolean),
    },
  }))
  // 도시 줄의 제목에는 나라 이름을 넣지 않는다 ("일본"을 치면 일본 도시가 다 나오지 않게). 나라는 목록 설명에 "→ 나라"로
  const cities = unique.flatMap((p) =>
    citiesOf(p).map((city) => ({ id: `${p.key}-city-${city}`, label: city, auxiliaryData: { place: p, keywords: [], country: p.name } })),
  )
  return [...countries.sort(byStatusThenName), ...cities.sort(byStatusThenName)]
}

// Astryx createStaticSource와 같은 규칙 (대소문자 무시, 이름이나 다른 이름에 글자가 들어 있으면)
export function matches(item, query) {
  const q = query.toLowerCase().trim()
  return [item.label, ...item.auxiliaryData.keywords].some((t) => t.toLowerCase().includes(q))
}
