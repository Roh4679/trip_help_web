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

// 날짜변경선(경도 180°)을 넘는 나라: 서경 부분이 지도 반대쪽 끝에 따로 그려지므로 경도 180°에서 잘라 낸다
// 러시아 동쪽 끝(추코트카, 브랑겔섬)이 알래스카 옆에 그려지는 조각. 러시아는 그 밖에 서경 땅이 없다
export const CUT_AT_ANTIMERIDIAN = ['643']
const EAST_EDGE = 179.99 // 정확히 180이면 왼쪽(-180)으로 그려질 수 있어 살짝 안쪽

function cutAtAntimeridian(f) {
  if (!CUT_AT_ANTIMERIDIAN.includes(f.id)) return f
  const clamp = (ring) => ring.map(([lon, lat]) => [lon < 0 ? EAST_EDGE : lon, lat])
  const polygons = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates]
  return { ...f, geometry: { type: 'MultiPolygon', coordinates: polygons.map((rings) => rings.map(clamp)) } }
}

export function splitOverseas(features) {
  return features.map(cutAtAntimeridian).flatMap((f) => {
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
