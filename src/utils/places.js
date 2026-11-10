import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import world from 'world-atlas/countries-110m.json'
import countries from '../data/countries.json'
import { HOME_ID } from '../config.js'
import { countryStatus } from './countryStatus.js'
import { countryName } from './countryName.js'
import { splitOverseas } from './overseas.js'

// 지도에 올라가는 장소 목록. 지도(WorldMap)와 나라 검색(CountrySearch)이 같이 쓴다
export const WIDTH = 960
export const HEIGHT = 460
const ANTARCTICA = '010'

const features = splitOverseas(feature(world, world.objects.countries).features.filter((f) => f.id !== ANTARCTICA))
export const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], { type: 'FeatureCollection', features })
const path = geoPath(projection)
const dataById = Object.fromEntries(countries.filter((c) => c.id).map((c) => [c.id, c]))

// 지도 위 나라 모양 (렌더할 때마다 다시 계산하지 않도록 미리 만든다)
export const shapes = features.map((f, i) => {
  const data = dataById[f.id]
  const status = f.id === HOME_ID ? 'home' : countryStatus(data)
  return {
    // 크림반도처럼 한 나라 id가 두 모양에 붙을 수 있어 key에 순번을 붙인다
    key: `${f.id ?? 'noid'}-${i}`,
    id: f.id,
    d: path(f),
    bounds: path.bounds(f), // 검색으로 골랐을 때 확대할 범위
    englishName: f.properties.name,
    name: data?.name ?? countryName(f),
    data,
    status,
  }
})

// 지도에 없거나 너무 작은 나라(싱가포르 등): 모양 대신 핀으로만 표시한다
export const smallPlaces = countries
  .filter((c) => c.marker)
  .map((c) => ({
    key: `marker-${c.iso2}`,
    id: c.iso2,
    point: projection(c.pin),
    offset: c.marker.offset ?? [0, 0], // 이웃 핀과 겹치면 화면 px만큼 옮겨 그리고 원래 위치까지 선을 긋는다
    name: c.name,
    data: c,
    status: countryStatus(c),
  }))

// 핀: 볼 수 있는 나라 + 작은 나라 (작은 나라는 상태와 상관없이 핀을 꽂고 색으로 구분한다)
export const pins = [
  ...shapes.filter((s) => s.status === 'ok' && s.data.pin && !s.data.marker).map((s) => ({ place: s, point: projection(s.data.pin), offset: [0, 0] })),
  ...smallPlaces.map((p) => ({ place: p, point: p.point, offset: p.offset })),
]
