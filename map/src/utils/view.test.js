// 실행: node map/src/utils/view.test.js — 좌우로 끝없이 이어지는 지도의 보기 계산
import assert from 'node:assert/strict'
import { xCenter, lonOf, xFor, wrapLon, nearestLon, clampY, meanLon, visibleBox, fitView, copiesInView, screenSpanX } from './view.js'
import { START_LON } from '../config.js'

const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`)
const DEG = 2 // 경도 1도 = 2px 라고 치고

// 처음 화면: x가 가운데 기준이면 중심 경도는 START_LON (한국)
assert.equal(xCenter(1), 0)
near(lonOf({ k: 1, x: 0 }, DEG), START_LON)
// 오른쪽으로 끌면(x 증가) 중심이 서쪽으로, 끝없이 돌아간다
near(lonOf({ k: 1, x: 20 }, DEG), START_LON - 10)
near(lonOf({ k: 1, x: 720 * 3 }, DEG), START_LON - 1080) // 세 바퀴 → 같은 곳
// 확대해도 같은 끌기 거리면 덜 돈다
near(lonOf({ k: 2, x: xCenter(2) + 20 }, DEG), START_LON - 5)
// xFor는 lonOf의 반대
for (const [lon, k] of [[127, 1], [-60, 2.5], [400, 3]]) near(lonOf({ k, x: xFor(lon, k, DEG) }, DEG), lon)

assert.equal(wrapLon(190), -170)
assert.equal(wrapLon(-190), 170)
assert.equal(wrapLon(540), -180)
assert.equal(nearestLon(170, -170), 190) // 20°만 돈다
assert.equal(nearestLon(127 + 720, 127), 127 + 720) // 몇 바퀴 돌았어도 가장 가까운 곳

// 세로: 지도 밖 빈 곳이 보이지 않게
assert.equal(clampY(10, 1), 0)
assert.equal(clampY(-999, 2), 460 - 2 * 460)

// 경도 평균: 날짜변경선을 넘어도 맞게
near(meanLon([170, -170]), 180, 1e-6)
near(meanLon([100, 140]), 120, 1e-6)

// 보이는 영역: 1280×800 화면은 지도 폭에 맞춰 그려지고(위아래 여백), 오른쪽 패널 360px만큼 가려진다
const box = visibleBox(1280, 800, { right: 360 })
near(box.x0, 0)
near(box.x1, (1280 - 360) * (960 / 1280))
assert.equal(box.y0, 0)
assert.equal(box.y1, 460)

// 맞추기: 결과가 보이는 영역 가운데로, 너무 많이 확대하지 않게
const small = fitView([[470, 220], [490, 240]], 100, { x0: 0, x1: 690, y0: 0, y1: 460 }, 3, DEG)
assert.equal(small.k, 3) // 작은 곳 하나여도 최대 3배
const wide = fitView([[100, 100], [860, 300]], 100, { x0: 0, x1: 690, y0: 0, y1: 460 }, 3, DEG)
assert.equal(wide.k, 1) // 넓으면 더 줄이지 않는다 (최소 1배)
// 결과 가운데(480)가 보이는 영역 가운데(345)에 오도록 더 돌린다: 그려진 위치 xCenter(k) + k·X(새 경도) = 345
const p = fitView([[380, 200], [580, 260]], 100, { x0: 0, x1: 690, y0: 0, y1: 460 }, 3, DEG)
const X = 480 - (p.lon - 100) * DEG // 결과 가운데의 새 지도 좌표
near(xCenter(p.k) + p.k * X, 345, 1e-6)
// 양옆 복사본: 화면에 걸칠 때만
const P = 971.7 // 한 장 폭 (적도)
assert.deepEqual(copiesInView(1, P, ...screenSpanX(1280, 800)), [0]) // 보통 화면, 1배: 가운데 장만
assert.deepEqual(copiesInView(1, P, ...screenSpanX(2560, 1080)), [-1, 0, 1]) // 아주 넓은 화면: 양옆도
assert.deepEqual(copiesInView(1, P, ...screenSpanX(5120, 1440)), [-1, 0, 1])
assert.deepEqual(copiesInView(3, P, ...screenSpanX(5120, 1440)), [0]) // 확대하면 가운데 장만으로 충분
const [a, b] = screenSpanX(2560, 1080)
near(a, -(2560 - 960 * (1080 / 460)) / 2 / (1080 / 460), 1e-9)
assert.ok(b > 960)
console.log('ok')
