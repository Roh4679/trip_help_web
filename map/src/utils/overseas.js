import { geoCentroid } from 'd3-geo'

// 지도 데이터에서 본국 모양에 붙어 있지만 따로 다뤄야 하는 곳 (PLANNING_map.md 4.1)
// isPart는 조각의 중심 [경도, 위도]를 받아 떼어낼 조각인지 판단한다
export const OVERSEAS = [
  // 기후·입국 정보가 프랑스와 다름
  { from: '250', id: '254', name: 'French Guiana', isPart: ([lon]) => lon < -30 },
  // 본토와 기후가 다른 별도 여행지 (ISO 숫자 코드가 없어 데이터의 id도 'US-HI')
  { from: '840', id: 'US-HI', name: 'Hawaii', isPart: ([lon, lat]) => lon < -150 && lat < 30 },
  // 외교부 기준 우크라이나 영토 → 우크라이나와 같은 상태로 표시
  { from: '643', id: '804', name: 'Ukraine', isPart: ([lon, lat]) => lon > 32 && lon < 37 && lat > 44 && lat < 46.5 },
]

export function splitOverseas(features) {
  return features.flatMap((f) => {
    const rule = OVERSEAS.find((r) => r.from === f.id)
    if (!rule) return [f]
    const polygons = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates]
    const isPart = (c) => rule.isPart(geoCentroid({ type: 'Polygon', coordinates: c }))
    return [
      { ...f, geometry: { type: 'MultiPolygon', coordinates: polygons.filter((c) => !isPart(c)) } },
      { type: 'Feature', id: rule.id, properties: { name: rule.name }, geometry: { type: 'MultiPolygon', coordinates: polygons.filter(isPart) } },
    ]
  })
}
