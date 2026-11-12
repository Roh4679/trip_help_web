// 지도 보기 계산 (좌우로 끝없이 이어지는 지도). 화면과 분리한 순수 함수
// d3-zoom의 변환 { k, x, y } 중 가로 이동(x)은 지도를 옮기는 데 쓰지 않고 "중심 경도(회전)"로 바꿔 쓴다
//  - 그리기: 투영을 중심 경도로 돌리고, 지도 그룹은 가운데 기준으로만 확대(xCenter) + 세로 이동(y)
//  - degPx: 적도에서 경도 1도가 지도 좌표로 몇 px인지 (places.js가 투영에서 잰다)
import { MAP_SIZE, START_LON } from '../config.js'

const [W, H] = MAP_SIZE

// 가운데를 기준으로 k배 했을 때 지도 그룹의 가로 위치
export const xCenter = (k) => (W / 2) * (1 - k)

// 변환 → 중심 경도 (끝없이 돌릴 수 있어 -180~180으로 묶지 않는다. 투영은 360° 단위로 같다)
export const lonOf = (t, degPx) => START_LON - (t.x - xCenter(t.k)) / (t.k * degPx)

// 중심 경도·배율 → 변환의 가로 값 (lonOf의 반대)
export const xFor = (lon, k, degPx) => xCenter(k) - (lon - START_LON) * k * degPx

// -180 ~ 180으로
export const wrapLon = (lon) => ((((lon + 180) % 360) + 360) % 360) - 180

// from에서 가장 가깝게 돌아가는 to (예: 170°에서 -170°로는 20°만 돈다)
export const nearestLon = (from, to) => from + wrapLon(to - from)

// 세로 이동 제한: 지도 위아래 밖 빈 곳이 보이지 않게 (드래그할 때와 같은 규칙)
export const clampY = (y, k) => Math.min(0, Math.max(H - k * H, y))

// 여러 경도의 가운데 (원 위 평균: 170°와 -170°의 가운데는 180°)
export function meanLon(lons) {
  const r = Math.PI / 180
  const sx = lons.reduce((s, l) => s + Math.cos(l * r), 0)
  const sy = lons.reduce((s, l) => s + Math.sin(l * r), 0)
  return Math.atan2(sy, sx) / r
}

// 화면에 보이는 지도 영역(지도 좌표). svg는 viewBox를 가운데 맞춤(meet)으로 그린다
// inset: 가려지는 화면 px { right, top, bottom, left } (예: 추천 패널 폭만큼 right)
export function visibleBox(screenW, screenH, inset = {}) {
  const s = Math.min(screenW / W, screenH / H)
  const ox = (screenW - W * s) / 2
  const oy = (screenH - H * s) / 2
  const { right = 0, top = 0, bottom = 0, left = 0 } = inset
  return {
    x0: Math.max(0, (left - ox) / s),
    x1: Math.min(W, (screenW - right - ox) / s),
    y0: Math.max(0, (top - oy) / s),
    y1: Math.min(H, (screenH - bottom - oy) / s),
  }
}

// 여러 곳이 보이는 영역 안에 모두 들어오게 하는 보기
// bounds: 가운데 경도 lonC로 돌린 투영에서 잰 범위 [[x0,y0],[x1,y1]], box: visibleBox, maxZoom: 너무 많이 확대하지 않게
// → { lon, k, y } (lon은 결과 가운데가 보이는 영역 가운데에 오도록 조금 더 돌린 경도)
export function fitView(bounds, lonC, box, maxZoom, degPx, fill = 0.85) {
  const [[bx0, by0], [bx1, by1]] = bounds
  const bw = Math.max(bx1 - bx0, 20) // 작은 나라 하나여도 지나치게 확대하지 않게 최소 크기
  const bh = Math.max(by1 - by0, 20)
  const k = Math.min(maxZoom, Math.max(1, fill * Math.min((box.x1 - box.x0) / bw, (box.y1 - box.y0) / bh)))
  const cx = (bx0 + bx1) / 2
  const cy = (by0 + by1) / 2
  const vx = (box.x0 + box.x1) / 2
  const vy = (box.y0 + box.y1) / 2
  // 결과 가운데(cx)가 화면의 vx에 오려면: 그려진 위치 xCenter(k) + k·X = vx → X = (vx - xCenter(k)) / k
  // 경도를 Δ만큼 더 돌리면 지도 좌표 X가 Δ·degPx만큼 왼쪽으로 간다
  const lon = lonC + (cx - (vx - xCenter(k)) / k) / degPx
  return { lon, k, y: clampY(vy - k * cy, k) }
}

// 지도 한 장의 가로 폭(적도, 지도 좌표)이 period일 때, 화면 가로 [sx0, sx1](지도 좌표)에 걸치는 복사본 번호 목록
// 가운데 장이 0, 왼쪽 -1, 오른쪽 +1 … (구글 지도처럼 양옆에 이어 그려 끝이 보이지 않게)
export function copiesInView(k, period, sx0, sx1) {
  const out = []
  for (let n = -2; n <= 2; n++) {
    const left = xCenter(k) + k * (W / 2 + n * period - period / 2)
    const right = left + k * period
    if (right > sx0 && left < sx1) out.push(n)
  }
  return out
}

// 화면 전체 가로(지도 밖 여백 포함)를 지도 좌표로 [sx0, sx1]
export function screenSpanX(screenW, screenH) {
  const s = Math.min(screenW / W, screenH / H)
  const ox = (screenW - W * s) / 2
  return [-ox / s, (screenW - ox) / s]
}

// ── 지구본 ──────────────────────────────────────────────
// 지구본도 d3-zoom 변환을 쓴다: 가로 값(x) → 중심 경도(평면과 같은 lonOf), 세로 값(y) → 중심 위도
// 아래로 끌면(y 증가) 위쪽이 화면 가운데로 내려와 중심 위도가 올라간다
export const yCenter = (k) => (H / 2) * (1 - k)

export function latOf(t, degPx, startLat) {
  return startLat + (t.y - yCenter(t.k)) / (t.k * degPx)
}

export function yForLat(lat, k, degPx, startLat) {
  return yCenter(k) + (lat - startLat) * k * degPx
}

// 위도를 ±maxLat 안으로 (넘어가면 그 자리에 멈춘다 — 반대로 끌 때 헛도는 구간이 없게 변환 자체를 묶는다)
export function clampGlobeY(y, k, degPx, startLat, maxLat) {
  return Math.min(yForLat(maxLat, k, degPx, startLat), Math.max(yForLat(-maxLat, k, degPx, startLat), y))
}
