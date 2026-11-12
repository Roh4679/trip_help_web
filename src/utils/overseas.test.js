// 실행: node src/utils/overseas.test.js
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { feature } from 'topojson-client'
import { geoCentroid } from 'd3-geo'
import { splitOverseas, OVERSEAS } from './overseas.js'

const world = JSON.parse(readFileSync(new URL('../../node_modules/world-atlas/countries-110m.json', import.meta.url)))
const before = feature(world, world.objects.countries).features
const after = splitOverseas(before)
const count = (id) => before.filter((f) => f.id === id).reduce((n, f) => n + (f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates.length : 1), 0)

for (const r of OVERSEAS) {
  const split = after.find((f) => f.id === r.id && f.properties.name === r.name)
  assert.ok(split && split.geometry.coordinates.length > 0, `${r.name} 조각이 떼어지지 않음`)
  // 조각을 잃거나 늘리지 않는다: 본국 + 떼어낸 조각 = 원래 조각 수
  const home = after.find((f) => f.id === r.from)
  assert.equal(home.geometry.coordinates.length + split.geometry.coordinates.length, count(r.from), r.name)
}
assert.equal(after.find((f) => f.properties.name === 'Hawaii').geometry.coordinates.length, 5) // 하와이 섬 5개
assert.equal(after.find((f) => f.properties.name === 'Ukraine' && f.id === '804' && f.geometry.coordinates.length === 1) !== undefined, true) // 크림반도 1조각
// 알래스카(북위 50도 위)는 미국에 남는다
const us = after.find((f) => f.id === '840')
assert.ok(us.geometry.coordinates.some((c) => geoCentroid({ type: 'Polygon', coordinates: c })[1] > 50))
// 러시아 동쪽 끝: 서경 좌표가 남지 않는다 (알래스카 옆 조각 없음). 조각 수는 그대로
const ru = after.find((f) => f.id === '643')
assert.ok(ru.geometry.coordinates.every((rings) => rings.every((ring) => ring.every(([lon]) => lon >= 0))))
console.log('ok')
