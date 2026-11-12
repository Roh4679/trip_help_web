import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import { interpolate } from 'd3-interpolate'
import 'd3-transition' // selection.transition() (부드럽게 움직이기)
import { geoCentroid, geoDistance, geoPath } from 'd3-geo'
import { useToast } from '@astryxdesign/core/Toast'
import { Button } from '@astryxdesign/core/Button'
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl'
import {
  COLORS, RISK_COLORS, PIN_COLORS, PIN_SMALL, RESULT_DIM_OPACITY, MAX_ZOOM, ZOOM_STEP, DANGER_HATCH,
  TOUCH_QUERY, PORTRAIT_LAT, TOUCH_HIT_RADIUS, FOCUS_ZOOM, START_LON, FIT_RESULTS, GLOBE,
} from '../config.js'
import { useMedia } from '../utils/useMedia.js'
import { WIDTH, HEIGHT, DEG_PX, WORLD_PX, makeProjection, makeGlobe, shapes, smallPlaces, pins, PIN_PATH } from '../utils/places.js'
import {
  xCenter, lonOf, xFor, nearestLon, clampY, meanLon, visibleBox, fitView, copiesInView, screenSpanX,
  latOf, yForLat, clampGlobeY,
} from '../utils/view.js'
import { placeNotice } from '../utils/format.js'
import CountryTooltip from './CountryTooltip.jsx'
import { COLOR, cardStyle } from '../../../shared/tokens.js'

// 여행경보 단계별 색. 정보를 제공하지 않는 나라(3·4)는 빗금 무늬 (넓은 나라가 너무 무겁게 보이지 않게)
const HATCHED = [3, 4]
const fillOf = (tone) => (HATCHED.includes(tone) ? `url(#hatch-${tone})` : (COLORS[tone] ?? RISK_COLORS[tone]))

// ── 평면 ── 중심 경도·배율·세로 이동 → d3-zoom 변환 (가로 값은 회전으로 바꿔 쓰므로 xFor로 만든다)
const viewTransform = (lon, k, y) => zoomIdentity.translate(xFor(lon, k, DEG_PX), clampY(y, k)).scale(k)

// ── 지구본 ── 중심 경도·위도·배율 → d3-zoom 변환 (가로 값 → 경도, 세로 값 → 위도)
const globeTransform = (lon, lat, k) =>
  zoomIdentity.translate(xFor(lon, k, DEG_PX), clampGlobeY(yForLat(lat, k, DEG_PX, GLOBE.startLat), k, DEG_PX, GLOBE.startLat, GLOBE.maxLat)).scale(k)
const globeLat = (t) => latOf(t, DEG_PX, GLOBE.startLat)

// 처음(과 '원래대로') 보여줄 위치: 한국 근처(lon, 기본 START_LON)가 가운데.
// 평면에서 세로 화면이면 지도가 가운데 가는 띠로만 보이므로, 화면 높이를 채우도록 확대하고 PORTRAIT_LAT를 가운데 둔다
function startTransform(svgEl, mode, lon = START_LON) {
  if (mode === 'globe') return globeTransform(lon, GLOBE.startLat, 1)
  const { width, height } = svgEl.getBoundingClientRect()
  if (height <= width) return viewTransform(lon, 1, 0)
  const k = Math.min((height * WIDTH) / width / HEIGHT, MAX_ZOOM) // 화면에 보이는 높이 ÷ 지도 높이
  const [, py] = makeProjection(lon)([lon, PORTRAIT_LAT])
  return viewTransform(lon, k, HEIGHT / 2 - k * py)
}

// 검색으로 고른 장소: 그 나라가 가운데 오도록 (가장 가까운 방향으로) 돌린다
// 평면: 나라 모양이면 화면에 꽉 차게, 작은 나라 핀이면 FOCUS_ZOOM배 / 지구본: 돌리기만 (배율은 그대로)
function focusTransform(place, t, mode) {
  const lonlat = place.feature ? geoCentroid(place.feature) : place.lonlat
  const lon = nearestLon(lonOf(t, DEG_PX), lonlat[0])
  if (mode === 'globe') return globeTransform(lon, lonlat[1], t.k)
  const projection = makeProjection(lonlat[0])
  let k = FOCUS_ZOOM.point
  let cy = projection(lonlat)[1]
  if (place.feature) {
    const [[x0, y0], [x1, y1]] = geoPath(projection).bounds(place.feature)
    k = FOCUS_ZOOM.fill / Math.max((x1 - x0) / WIDTH, (y1 - y0) / HEIGHT)
    cy = (y0 + y1) / 2
  }
  k = Math.min(Math.max(k, 1), MAX_ZOOM) // 지도보다 큰 나라(러시아 등)도 더 줄이지 않는다
  return viewTransform(lon, k, HEIGHT / 2 - k * cy)
}

// highlight: 추천 결과 나라의 iso2 Set. 있으면 결과 나라만 진하게, 나머지는 흐리게 (null이면 평소대로)
export default function WorldMap({ ref, onSelect, isZoomEnabled = true, controlsRight = 12, controlsTop = null, highlight = null }) {
  const dimmed = (place) => highlight && !highlight.has(place.data?.iso2)
  const toast = useToast()
  const [hover, setHover] = useState(null)
  const [transform, setTransform] = useState(() => viewTransform(START_LON, 1, 0))
  // 'flat'(평면, 처음) 또는 'globe'(지구본). d3-zoom 제한 함수가 읽으므로 ref에도 둔다
  const [mode, setMode] = useState('flat')
  const modeRef = useRef(mode)
  const svgRef = useRef(null)
  const zoomRef = useRef(null)
  const enabledRef = useRef(isZoomEnabled)
  const isTouch = useMedia(TOUCH_QUERY)
  enabledRef.current = isZoomEnabled

  // 화면 크기 (양옆 복사본이 화면에 걸치는지 계산하려고). 창 크기가 바뀌면 다시 잰다
  const [size, setSize] = useState({ width: WIDTH, height: HEIGHT })
  useEffect(() => {
    const el = svgRef.current
    const ro = new ResizeObserver(() => setSize({ width: el.clientWidth, height: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const svg = select(svgRef.current)
    zoomRef.current = zoom()
      .scaleExtent([1, MAX_ZOOM])
      // 이동 제한: 가로는 끝없이(회전). 세로는 평면이면 지도 위아래 밖이 보이지 않게, 지구본이면 위도 ±GLOBE.maxLat까지
      .constrain((t) =>
        zoomIdentity
          .translate(t.x, modeRef.current === 'globe' ? clampGlobeY(t.y, t.k, DEG_PX, GLOBE.startLat, GLOBE.maxLat) : clampY(t.y, t.k))
          .scale(t.k),
      )
      // 부드럽게 움직일 때 기본 보간(멀리 갈 때 크게 줄였다 키움)은 회전과 맞지 않아 직선 보간
      .interpolate(interpolate)
      // 창(Dialog)이 열려 있으면 휠·드래그 확대를 받지 않는다
      .filter((e) => enabledRef.current && (!e.ctrlKey || e.type === 'wheel') && !e.button)
      .on('zoom', (e) => setTransform(e.transform))
    // 두 번 클릭 확대 끔. 끌기가 끝날 때의 클릭은 d3-zoom이 막아 준다 (나라가 잘못 눌리지 않게)
    svg.call(zoomRef.current).on('dblclick.zoom', null)
    zoomRef.current.transform(svg, startTransform(svgRef.current, 'flat'))
    return () => svg.on('.zoom', null)
  }, [])

  // 지금 보기
  //  평면: 중심 경도로 투영을 돌리고, 지도 그룹은 가운데 기준 확대 + 세로 이동만. 양옆에 복사본
  //  지구본: 중심 경도·위도로 공을 돌리고, 배율만큼 공을 키운다 (그룹 변환 없음)
  const isGlobe = mode === 'globe'
  const { k } = transform
  const lon = lonOf(transform, DEG_PX)
  const lat = isGlobe ? globeLat(transform) : 0
  const projection = useMemo(() => (isGlobe ? makeGlobe(lon, lat, k) : makeProjection(lon)), [isGlobe, lon, lat, k])
  const path = useMemo(() => geoPath(projection), [projection])
  const dByKey = useMemo(() => Object.fromEntries(shapes.map((s) => [s.key, path(s.feature)])), [path])
  const groupTransform = isGlobe ? undefined : `translate(${xCenter(k)},${transform.y}) scale(${k})`
  const toScreen = ([px, py]) => (isGlobe ? [px, py] : [xCenter(k) + k * px, transform.y + k * py])
  // 같은 지도를 양옆에 이어 그린다 (구글 지도처럼 화면 어디에도 끝이 안 보이게). 화면에 걸치는 장만. 지구본은 한 장
  const copies = isGlobe ? [0] : copiesInView(k, WORLD_PX, ...screenSpanX(size.width, size.height))
  // 지구본 뒤쪽(보이지 않는 반구)에 있는 핀은 그리지 않는다
  const pinVisible = (lonlat) => !isGlobe || geoDistance(lonlat, [lon, lat]) < Math.PI / 2 - 0.02

  const svgSel = () => select(svgRef.current)
  const zoomBy = (factor) => zoomRef.current.scaleBy(svgSel(), factor)
  const resetZoom = () => zoomRef.current.transform(svgSel(), startTransform(svgRef.current, modeRef.current))

  // 평면 ↔ 지구본: 지금 보는 경도는 그대로 두고 그 방식의 처음 모양으로
  const beforeFitRef = useRef(null) // 추천 결과를 맞추기 직전 위치 (결과가 사라지면 여기로 돌아간다)
  const changeMode = (next) => {
    if (next === modeRef.current) return
    const now = lonOf(transform, DEG_PX)
    modeRef.current = next
    beforeFitRef.current = null // 다른 방식의 위치로는 돌아가지 않는다
    setMode(next)
    setHover(null)
    zoomRef.current.transform(svgSel(), startTransform(svgRef.current, next, now))
  }

  // 메모지는 마우스에서만 띄운다 (터치는 누르면 바로 상세 창이 열리므로)
  const buttonSize = isTouch ? 'md' : 'sm'
  // copy: 마우스가 올라간 복사본 번호 (테두리를 그 장에 그리려고)
  const hoverAt = (s, copy) => (e) => e.pointerType === 'mouse' && setHover({ shape: s, copy, x: e.clientX, y: e.clientY })
  const hoverProps = (s, copy = 0) => ({
    onPointerMove: hoverAt(s, copy),
    onClick: () => handleClick(s),
    style: { cursor: 'pointer' },
  })

  // 부드럽게 움직이기 (추천 결과 맞추기·돌아가기)
  const animateTo = (t) => svgSel().transition().duration(FIT_RESULTS.duration).call(zoomRef.current.transform, t)

  useImperativeHandle(ref, () => ({
    // 나라 검색에서 고르면: 그 나라가 가운데 오도록 돌린 뒤 지도에서 누른 것과 똑같이 동작한다
    focus(place) {
      zoomRef.current.transform(svgSel(), focusTransform(place, transform, modeRef.current))
      handleClick(place)
    },
    // 추천 결과 나라들(iso2 목록)이 오른쪽 rightPx만큼 가려지는 화면에서도 모두 보이게 돌리고 맞춘다
    // 지구본은 결과 나라들의 가운데로 돌리기만 한다
    fit(iso2s, rightPx) {
      const geoms = iso2s.flatMap((iso) => {
        const small = smallPlaces.find((p) => p.data.iso2 === iso)
        if (small) return [{ type: 'Feature', geometry: { type: 'Point', coordinates: small.lonlat } }]
        return shapes.filter((s) => s.data?.iso2 === iso).map((s) => s.feature)
      })
      if (!geoms.length) return
      const centers = geoms.map((g) => geoCentroid(g))
      const lonC = meanLon(centers.map((c) => c[0])) // 결과들의 가운데 경도
      const now = lonOf(transform, DEG_PX)
      beforeFitRef.current ??= transform // 이미 맞춘 상태에서 다시 맞추면 처음 위치를 그대로 기억
      if (modeRef.current === 'globe') {
        const latC = centers.reduce((s, c) => s + c[1], 0) / centers.length
        return animateTo(globeTransform(nearestLon(now, lonC), latC, k))
      }
      const bounds = geoPath(makeProjection(lonC)).bounds({ type: 'FeatureCollection', features: geoms })
      const { width, height } = svgRef.current.getBoundingClientRect()
      const { inset } = FIT_RESULTS
      const box = visibleBox(width, height, { ...inset, right: inset.right + rightPx })
      const v = fitView(bounds, lonC, box, FIT_RESULTS.maxZoom, DEG_PX)
      animateTo(viewTransform(nearestLon(now, v.lon), v.k, v.y))
    },
    // 결과를 닫거나 조건을 바꾸면 맞추기 직전 위치로 (가장 가까운 방향으로 돌아간다)
    restore() {
      const before = beforeFitRef.current
      if (!before) return
      beforeFitRef.current = null
      const lonTo = nearestLon(lonOf(transform, DEG_PX), lonOf(before, DEG_PX))
      animateTo(modeRef.current === 'globe' ? globeTransform(lonTo, globeLat(before), before.k) : viewTransform(lonTo, before.k, before.y))
    },
  }))

  function handleClick(place) {
    if (place.status === 'ok') return onSelect?.(place.data)
    // 상세 창 대신 토스트. 여행경보가 있으면 토스트를 누르면 해외안전여행 페이지가 새 탭으로 열린다
    const { detail, url } = placeNotice(place)
    const text = `${place.name} · ${detail}`
    const body = url ? <a href={url} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{text}</a> : text
    toast({ body, uniqueID: 'map-click' })
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        // 지구본은 공 밖을 연한 회색으로, 평면은 바다색으로
        style={{ width: '100%', height: '100%', display: 'block', background: isGlobe ? COLOR.surfaceSub : COLORS.ocean }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          {/* 빗금 간격·굵기가 화면 기준으로 그대로 보이게: 평면은 확대 배율만큼 줄이고, 지구본은 그룹 확대가 없으니 그대로 */}
          {HATCHED.map((tone) => (
            <pattern
              key={tone}
              id={`hatch-${tone}`}
              patternUnits="userSpaceOnUse"
              width={DANGER_HATCH.gap}
              height={DANGER_HATCH.gap}
              patternTransform={`scale(${isGlobe ? 1 : 1 / k}) rotate(45)`}
            >
              <rect width={DANGER_HATCH.gap} height={DANGER_HATCH.gap} fill={RISK_COLORS[tone].base} />
              <line x1={0} y1={0} x2={0} y2={DANGER_HATCH.gap} stroke={RISK_COLORS[tone].hatch} strokeWidth={DANGER_HATCH.width} />
            </pattern>
          ))}
        </defs>
        {/* 지구본의 바다(공) */}
        {isGlobe && <path d={path({ type: 'Sphere' })} fill={COLORS.ocean} stroke={COLOR.borderStrong} strokeWidth={1} />}
        {/* 확대해도 선 두께는 그대로 (non-scaling-stroke) */}
        <g transform={groupTransform}>
          {/* 복사본마다 같은 나라 모양을 한 장 폭(WORLD_PX)씩 옮겨 그린다. 마우스 올리기·클릭·빗금·추천 강조도 똑같이 */}
          {copies.map((n) => (
            <g key={n} transform={n ? `translate(${n * WORLD_PX},0)` : undefined}>
              {shapes.map((s) =>
                dByKey[s.key] ? (
                  <path key={s.key} d={dByKey[s.key]} fill={fillOf(s.tone)} opacity={dimmed(s) ? RESULT_DIM_OPACITY : 1} stroke={COLORS.border} strokeWidth={0.5} vectorEffect="non-scaling-stroke" {...hoverProps(s, n)} />
                ) : null, // 지구본 뒤쪽이라 안 보이는 나라
              )}
            </g>
          ))}
          {/* 이웃 나라에 가려지지 않게 테두리를 맨 위에 한 번 더 그린다 (마우스가 올라간 복사본에) */}
          {hover?.shape.feature && dByKey[hover.shape.key] && (
            <path d={dByKey[hover.shape.key]} transform={hover.copy ? `translate(${hover.copy * WORLD_PX},0)` : undefined} fill="none" stroke={COLORS.hoverBorder} strokeWidth={1.2} vectorEffect="non-scaling-stroke" pointerEvents="none" />
          )}
        </g>

        {/* 핀은 줌 그룹 밖에 그려서 확대해도 크기가 일정하다. 색으로 상태를 구분한다 (작은 나라는 데이터가 없거나 위험해도 핀으로 표시) */}
        {pins.flatMap(({ place, lonlat, offset }) => (pinVisible(lonlat) ? copies : []).map((n) => {
          const pinScale = k < PIN_SMALL.untilZoom ? PIN_SMALL.scale : 1
          const [x0, y] = toScreen(projection(lonlat))
          const x = x0 + n * k * WORLD_PX // 복사본에도 같은 핀
          const [px, py] = [x + offset[0], y + offset[1]]
          const moved = offset[0] !== 0 || offset[1] !== 0
          return (
            <g key={`pin-${place.key}-${n}`} opacity={dimmed(place) ? RESULT_DIM_OPACITY : 1}>
              {/* 이웃 핀과 겹쳐서 옮긴 핀은 원래 위치까지 선을 긋는다 */}
              {moved && <line x1={x} y1={y} x2={px} y2={py} stroke={COLORS.hoverBorder} strokeWidth={0.8} />}
              {moved && <circle cx={x} cy={y} r={1.5} fill={COLORS.hoverBorder} />}
              <g transform={`translate(${px},${py}) scale(${pinScale})`} {...hoverProps(place, n)}>
                <path d={PIN_PATH} fill={PIN_COLORS[place.tone]} stroke="#fff" strokeWidth={1} />
                <circle cy={-12} r={2.2} fill="#fff" />
                {isTouch && <circle cy={-10} r={TOUCH_HIT_RADIUS} fill="transparent" />}
              </g>
            </g>
          )
        }))}
      </svg>
      {/* 평면/지구본 전환 + 확대 버튼: 다른 툴바·범례와 같은 흰 카드. controlsTop이 있으면 위쪽(휴대폰), 없으면 오른쪽 아래 */}
      <div
        style={{
          ...cardStyle,
          position: 'absolute',
          right: controlsRight,
          ...(controlsTop != null ? { top: controlsTop } : { bottom: 12 }),
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: 4,
          transition: 'right 0.2s',
        }}
      >
        <SegmentedControl value={mode} onChange={changeMode} label="지도 모양" size={buttonSize}>
          <SegmentedControlItem value="flat" label="평면" />
          <SegmentedControlItem value="globe" label="지구본" />
        </SegmentedControl>
        <span aria-hidden style={{ width: 1, alignSelf: 'stretch', margin: '4px', background: COLOR.border }} />
        <Button label="지도 확대" size={buttonSize} variant="ghost" onClick={() => zoomBy(ZOOM_STEP)}>+</Button>
        <Button label="지도 축소" size={buttonSize} variant="ghost" onClick={() => zoomBy(1 / ZOOM_STEP)}>−</Button>
        <Button label="지도 원래대로" size={buttonSize} variant="ghost" onClick={resetZoom}>원래대로</Button>
      </div>
      {hover && (
        <CountryTooltip name={hover.shape.name} data={hover.shape.data} status={hover.shape.status} x={hover.x} y={hover.y} />
      )}
    </div>
  )
}
