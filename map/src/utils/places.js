import { geoNaturalEarth1 } from 'd3-geo'
import { feature } from 'topojson-client'
import world from 'world-atlas/countries-110m.json'
import countries from '../data/countries.json'
import { HOME_ID, PIN_SHAPE_IDS, MAP_SIZE } from '../config.js'
import { countryStatus, riskTone } from './countryStatus.js'
import { countryName } from './countryName.js'
import { splitOverseas } from './overseas.js'

// 지도에 올라가는 장소 목록. 지도(WorldMap)와 나라 검색(CountrySearch)이 같이 쓴다
// 지도는 좌우로 끝없이 돌아가므로 화면 좌표는 미리 계산하지 않고, 그릴 때 그때의 중심 경도로 투영한다
export const [WIDTH, HEIGHT] = MAP_SIZE
const ANTARCTICA = '010'

const features = splitOverseas(feature(world, world.objects.countries).features.filter((f) => f.id !== ANTARCTICA))

// 크기·위치는 세계 전체에 한 번 맞추고, 회전(중심 경도)만 바꿔 쓴다
const base = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], { type: 'FeatureCollection', features })
const SCALE = base.scale()
const TRANSLATE = base.translate()
export const makeProjection = (lon) => geoNaturalEarth1().scale(SCALE).translate(TRANSLATE).rotate([-lon, 0])

// 적도에서 경도 1도가 지도 좌표로 몇 px인지 (가로로 끌기 → 회전 각도 환산에 쓴다)
export const DEG_PX = base([1, 0])[0] - base([0, 0])[0]
export const WORLD_PX = 360 * DEG_PX // 지도 한 장의 가로 폭(적도). 양옆 복사본을 이만큼 옮겨 그린다

const dataById = Object.fromEntries(countries.filter((c) => c.id).map((c) => [c.id, c]))

// 지도 위 나라 모양. feature(지리 데이터)를 들고 있다가 그릴 때 투영한다
export const shapes = features.map((f, i) => {
  const data = dataById[f.id]
  const status = f.id === HOME_ID ? 'home' : countryStatus(data)
  return {
    // 크림반도처럼 한 나라 id가 두 모양에 붙을 수 있어 key에 순번을 붙인다
    key: `${f.id ?? 'noid'}-${i}`,
    id: f.id,
    feature: f,
    englishName: f.properties.name,
    name: data?.name ?? countryName(f),
    data,
    status,
    tone: status === 'home' ? 'home' : riskTone(data), // 색 단계 (config RISK_COLORS·PIN_COLORS)
  }
})

// 지도에 없거나 너무 작은 나라(싱가포르 등): 모양 대신 핀으로만 표시한다. lonlat = [경도, 위도]
export const smallPlaces = countries
  .filter((c) => c.marker)
  .map((c) => ({
    key: `marker-${c.iso2}`,
    id: c.iso2,
    lonlat: c.pin,
    offset: c.marker.offset ?? [0, 0], // 이웃 핀과 겹치면 화면 px만큼 옮겨 그리고 원래 위치까지 선을 긋는다
    name: c.name,
    data: c,
    status: countryStatus(c),
    tone: riskTone(c),
  }))

export const PIN_PATH = 'M0,0 C-3,-5 -6,-8 -6,-12 A6,6 0 1,1 6,-12 C6,-8 3,-5 0,0Z' // 지도 핀과 범례가 같이 쓴다

// 핀: 지도에서 잘 안 보이는 작은 곳만 (작은 나라 marker + 하와이처럼 모양이 너무 작은 곳). 큰 나라는 색이 이미 상태를 보여 준다
// 작은 곳은 상태와 상관없이 핀을 꽂고 색으로 구분한다
export const pins = [
  ...shapes.filter((s) => PIN_SHAPE_IDS.includes(s.id) && s.data?.pin).map((s) => ({ place: s, lonlat: s.data.pin, offset: [0, 0] })),
  ...smallPlaces.map((p) => ({ place: p, lonlat: p.lonlat, offset: p.offset })),
]
