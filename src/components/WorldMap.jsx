import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import { useToast } from '@astryxdesign/core/Toast'
import { Button } from '@astryxdesign/core/Button'
import {
  COLORS, RISK_COLORS, PIN_COLORS, PIN_SMALL, MAX_ZOOM, ZOOM_STEP, DANGER_HATCH,
  TOUCH_QUERY, PORTRAIT_CENTER, TOUCH_HIT_RADIUS, FOCUS_ZOOM,
} from '../config.js'
import { useMedia } from '../utils/useMedia.js'
import { WIDTH, HEIGHT, projection, shapes, pins, PIN_PATH } from '../utils/places.js'
import { placeNotice } from '../utils/format.js'
import CountryTooltip from './CountryTooltip.jsx'

// 여행경보 단계별 색. 정보를 제공하지 않는 나라(3·4)는 빗금 무늬 (넓은 나라가 너무 무겁게 보이지 않게)
const HATCHED = [3, 4]
const fillOf = (tone) => (HATCHED.includes(tone) ? `url(#hatch-${tone})` : (COLORS[tone] ?? RISK_COLORS[tone]))

// 처음(과 '원래대로') 보여줄 위치. 세로 화면이면 지도가 가운데 가는 띠로만 보이므로,
// 화면 높이를 채우도록 확대하고 아시아(PORTRAIT_CENTER)를 가운데 둔다
function startTransform(svgEl) {
  const { width, height } = svgEl.getBoundingClientRect()
  if (height <= width) return zoomIdentity
  const visibleHeight = (height * WIDTH) / width // 화면에 보이는 높이 (지도 좌표)
  const k = Math.min(visibleHeight / HEIGHT, MAX_ZOOM)
  const [px, py] = projection(PORTRAIT_CENTER)
  return zoomIdentity.translate(WIDTH / 2 - k * px, HEIGHT / 2 - k * py).scale(k)
}

// 검색으로 고른 장소로 확대·이동할 위치. 나라 모양이면 화면에 꽉 차게, 작은 나라 핀이면 FOCUS_ZOOM배
function focusTransform(place) {
  let k = FOCUS_ZOOM.point
  let [cx, cy] = place.point ?? [0, 0]
  if (place.bounds) {
    const [[x0, y0], [x1, y1]] = place.bounds
    k = FOCUS_ZOOM.fill / Math.max((x1 - x0) / WIDTH, (y1 - y0) / HEIGHT)
    ;[cx, cy] = [(x0 + x1) / 2, (y0 + y1) / 2]
  }
  k = Math.min(Math.max(k, 1), MAX_ZOOM) // 지도보다 큰 나라(러시아 등)도 더 줄이지 않는다
  // 드래그할 때(translateExtent)처럼 지도 밖 빈 곳이 보이지 않게 이동 범위를 막는다. k=1이면 처음 위치 그대로
  const clamp = (v, size) => Math.min(0, Math.max(size - k * size, v))
  return zoomIdentity.translate(clamp(WIDTH / 2 - k * cx, WIDTH), clamp(HEIGHT / 2 - k * cy, HEIGHT)).scale(k)
}


export default function WorldMap({ ref, onSelect, isZoomEnabled = true, controlsRight = 12, controlsAtTop = false }) {
  const toast = useToast()
  const [hover, setHover] = useState(null)
  const [transform, setTransform] = useState(zoomIdentity)
  const svgRef = useRef(null)
  const zoomRef = useRef(null)
  const enabledRef = useRef(isZoomEnabled)
  const isTouch = useMedia(TOUCH_QUERY)
  enabledRef.current = isZoomEnabled

  useEffect(() => {
    const svg = select(svgRef.current)
    zoomRef.current = zoom()
      .scaleExtent([1, MAX_ZOOM])
      .translateExtent([[0, 0], [WIDTH, HEIGHT]])
      // 창(Dialog)이 열려 있으면 휠·드래그 확대를 받지 않는다
      .filter((e) => enabledRef.current && (!e.ctrlKey || e.type === 'wheel') && !e.button)
      .on('zoom', (e) => setTransform(e.transform))
    svg.call(zoomRef.current).on('dblclick.zoom', null) // 두 번 클릭 확대 끔
    zoomRef.current.transform(svg, startTransform(svgRef.current))
    return () => svg.on('.zoom', null)
  }, [])

  const zoomBy = (k) => zoomRef.current.scaleBy(select(svgRef.current), k)
  const resetZoom = () => zoomRef.current.transform(select(svgRef.current), startTransform(svgRef.current))

  // 메모지는 마우스에서만 띄운다 (터치는 누르면 바로 상세 창이 열리므로)
  const buttonSize = isTouch ? 'md' : 'sm'
  const hoverAt = (s) => (e) => e.pointerType === 'mouse' && setHover({ shape: s, x: e.clientX, y: e.clientY })
  const hoverProps = (s) => ({
    onPointerMove: hoverAt(s),
    onClick: () => handleClick(s),
    style: { cursor: 'pointer' },
  })

  // 나라 검색에서 고르면: 그 나라로 확대·이동한 뒤 지도에서 누른 것과 똑같이 동작한다
  useImperativeHandle(ref, () => ({
    focus(place) {
      zoomRef.current.transform(select(svgRef.current), focusTransform(place))
      handleClick(place)
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
        style={{ width: '100%', height: '100%', display: 'block', background: COLORS.ocean }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          {/* 확대 배율만큼 줄여서 빗금 간격·굵기가 화면 기준으로 그대로 보이게 한다 */}
          {HATCHED.map((tone) => (
            <pattern
              key={tone}
              id={`hatch-${tone}`}
              patternUnits="userSpaceOnUse"
              width={DANGER_HATCH.gap}
              height={DANGER_HATCH.gap}
              patternTransform={`scale(${1 / transform.k}) rotate(45)`}
            >
              <rect width={DANGER_HATCH.gap} height={DANGER_HATCH.gap} fill={RISK_COLORS[tone].base} />
              <line x1={0} y1={0} x2={0} y2={DANGER_HATCH.gap} stroke={RISK_COLORS[tone].hatch} strokeWidth={DANGER_HATCH.width} />
            </pattern>
          ))}
        </defs>
        {/* 확대해도 선 두께는 그대로 (non-scaling-stroke) */}
        <g transform={transform.toString()}>
          {shapes.map((s) => (
            <path key={s.key} d={s.d} fill={fillOf(s.tone)} stroke={COLORS.border} strokeWidth={0.5} vectorEffect="non-scaling-stroke" {...hoverProps(s)} />
          ))}
          {/* 이웃 나라에 가려지지 않게 테두리를 맨 위에 한 번 더 그린다 */}
          {hover?.shape.d && (
            <path d={hover.shape.d} fill="none" stroke={COLORS.hoverBorder} strokeWidth={1.2} vectorEffect="non-scaling-stroke" pointerEvents="none" />
          )}
        </g>

        {/* 핀은 줌 그룹 밖에 그려서 확대해도 크기가 일정하다. 색으로 상태를 구분한다 (작은 나라는 데이터가 없거나 위험해도 핀으로 표시) */}
        {pins.map(({ place, point, offset }) => {
          const pinScale = transform.k < PIN_SMALL.untilZoom ? PIN_SMALL.scale : 1
          const [x, y] = transform.apply(point)
          const [px, py] = [x + offset[0], y + offset[1]]
          const moved = offset[0] !== 0 || offset[1] !== 0
          return (
            <g key={`pin-${place.key}`}>
              {/* 이웃 핀과 겹쳐서 옮긴 핀은 원래 위치까지 선을 긋는다 */}
              {moved && <line x1={x} y1={y} x2={px} y2={py} stroke={COLORS.hoverBorder} strokeWidth={0.8} />}
              {moved && <circle cx={x} cy={y} r={1.5} fill={COLORS.hoverBorder} />}
              <g transform={`translate(${px},${py}) scale(${pinScale})`} {...hoverProps(place)}>
                <path d={PIN_PATH} fill={PIN_COLORS[place.tone]} stroke="#fff" strokeWidth={1} />
                <circle cy={-12} r={2.2} fill="#fff" />
                {isTouch && <circle cy={-10} r={TOUCH_HIT_RADIUS} fill="transparent" />}
              </g>
            </g>
          )
        })}
      </svg>
      <div style={{ position: 'absolute', right: controlsRight, [controlsAtTop ? 'top' : 'bottom']: 12, display: 'flex', gap: 6, transition: 'right 0.2s' }}>
        <Button label="지도 확대" size={buttonSize} elevation="low" onClick={() => zoomBy(ZOOM_STEP)}>+</Button>
        <Button label="지도 축소" size={buttonSize} elevation="low" onClick={() => zoomBy(1 / ZOOM_STEP)}>−</Button>
        <Button label="지도 원래대로" size={buttonSize} elevation="low" onClick={resetZoom}>원래대로</Button>
      </div>
      {hover && (
        <CountryTooltip name={hover.shape.name} data={hover.shape.data} status={hover.shape.status} x={hover.x} y={hover.y} />
      )}
    </div>
  )
}
