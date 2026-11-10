import { useEffect, useRef, useState } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import world from 'world-atlas/countries-110m.json'
import { useToast } from '@astryxdesign/core/Toast'
import { Button } from '@astryxdesign/core/Button'
import countries from '../data/countries.json'
import { COLORS, PIN_COLOR, BUBBLE_RADIUS, MAX_ZOOM, ZOOM_STEP, DANGER_HATCH } from '../config.js'
import { countryStatus } from '../utils/countryStatus.js'
import { countryName } from '../utils/countryName.js'
import { splitOverseas } from '../utils/overseas.js'
import { dangerText } from '../utils/format.js'
import CountryTooltip from './CountryTooltip.jsx'

const WIDTH = 960
const HEIGHT = 460
const ANTARCTICA = '010'

const features = splitOverseas(feature(world, world.objects.countries).features.filter((f) => f.id !== ANTARCTICA))
const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], { type: 'FeatureCollection', features })
const path = geoPath(projection)
const dataById = Object.fromEntries(countries.map((c) => [c.id, c]))

// 렌더할 때마다 다시 계산하지 않도록 미리 만들어 둔다
const shapes = features.map((f, i) => {
  const data = dataById[f.id]
  // 크림반도처럼 한 나라 id가 두 모양에 붙을 수 있어 key에 순번을 붙인다
  return { key: `${f.id ?? 'noid'}-${i}`, d: path(f), name: data?.name ?? countryName(f), data, status: countryStatus(data) }
})

// 지도에 없거나 너무 작은 나라는 버블이 곧 그 나라의 모양이다
const bubbles = countries
  .filter((c) => c.bubble)
  .map((c) => ({
    key: `bubble-${c.iso2}`,
    name: c.name,
    data: c,
    status: countryStatus(c),
    point: projection(c.pin),
    r: c.bubble.radius ?? BUBBLE_RADIUS,
    offset: c.bubble.offset ?? [0, 0],
  }))

// 데이터를 볼 수 있는 나라에만 핀 (버블이 있는 나라는 버블이 대신한다)
const pins = shapes
  .filter((s) => s.status === 'ok' && s.data.pin && !s.data.bubble)
  .map((s) => ({ shape: s, point: projection(s.data.pin) }))

// 위험 국가는 단색 대신 빗금 무늬로 칠한다 (넓은 나라가 너무 무겁게 보이지 않게)
const fillOf = (status) => (status === 'danger' ? 'url(#danger-hatch)' : COLORS[status])

const PIN_PATH = 'M0,0 C-3,-5 -6,-8 -6,-12 A6,6 0 1,1 6,-12 C6,-8 3,-5 0,0Z'

export default function WorldMap({ onSelect, isZoomEnabled = true, controlsRight = 12 }) {
  const toast = useToast()
  const [hover, setHover] = useState(null)
  const [transform, setTransform] = useState(zoomIdentity)
  const svgRef = useRef(null)
  const zoomRef = useRef(null)
  const enabledRef = useRef(isZoomEnabled)
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
    return () => svg.on('.zoom', null)
  }, [])

  const zoomBy = (k) => zoomRef.current.scaleBy(select(svgRef.current), k)
  const resetZoom = () => zoomRef.current.transform(select(svgRef.current), zoomIdentity)

  const hoverProps = (s) => ({
    onMouseMove: (e) => setHover({ shape: s, x: e.clientX, y: e.clientY }),
    onClick: () => handleClick(s),
    style: { cursor: 'pointer' },
  })

  function handleClick({ name, data, status }) {
    if (status === 'ok') return onSelect?.(data)
    const body =
      status === 'danger'
        ? `${name} · ${dangerText(data.risk)}`
        : `${name} · 곧 추가될 예정이에요~`
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
          {/* ponytail: 버블(줌 그룹 밖)도 같은 무늬를 써서 확대하면 버블 빗금만 촘촘해진다. 위험 국가 버블이 생기면 무늬를 따로 둔다 */}
          <pattern
            id="danger-hatch"
            patternUnits="userSpaceOnUse"
            width={DANGER_HATCH.gap}
            height={DANGER_HATCH.gap}
            patternTransform={`scale(${1 / transform.k}) rotate(45)`}
          >
            <rect width={DANGER_HATCH.gap} height={DANGER_HATCH.gap} fill={COLORS.danger} />
            <line x1={0} y1={0} x2={0} y2={DANGER_HATCH.gap} stroke={COLORS.dangerHatch} strokeWidth={DANGER_HATCH.width} />
          </pattern>
        </defs>
        {/* 확대해도 선 두께는 그대로 (non-scaling-stroke) */}
        <g transform={transform.toString()}>
          {shapes.map((s) => (
            <path key={s.key} d={s.d} fill={fillOf(s.status)} stroke={COLORS.border} strokeWidth={0.5} vectorEffect="non-scaling-stroke" {...hoverProps(s)} />
          ))}
          {/* 이웃 나라에 가려지지 않게 테두리를 맨 위에 한 번 더 그린다 */}
          {hover?.shape.d && (
            <path d={hover.shape.d} fill="none" stroke={COLORS.hoverBorder} strokeWidth={1.2} vectorEffect="non-scaling-stroke" pointerEvents="none" />
          )}
        </g>

        {/* 핀과 버블은 줌 그룹 밖에 그려서 확대해도 크기가 일정하다 */}
        {pins.map(({ shape, point }) => {
          const [x, y] = transform.apply(point)
          return (
            <g key={`pin-${shape.key}`} transform={`translate(${x},${y})`} {...hoverProps(shape)}>
              <path d={PIN_PATH} fill={PIN_COLOR} stroke="#fff" strokeWidth={1} />
              <circle cy={-12} r={2.2} fill="#fff" />
            </g>
          )
        })}
        {bubbles.map((b) => {
          const [x, y] = transform.apply(b.point)
          const [cx, cy] = [x + b.offset[0], y + b.offset[1]]
          const hovered = hover?.shape === b
          return (
            <g key={b.key}>
              {(b.offset[0] !== 0 || b.offset[1] !== 0) && <line x1={x} y1={y} x2={cx} y2={cy} stroke={COLORS.hoverBorder} strokeWidth={0.8} />}
              <circle
                cx={cx}
                cy={cy}
                r={b.r}
                fill={fillOf(b.status)}
                stroke={COLORS.hoverBorder}
                strokeWidth={hovered ? 2 : 1}
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))', cursor: 'pointer' }}
                onMouseMove={(e) => setHover({ shape: b, x: e.clientX, y: e.clientY })}
                onClick={() => handleClick(b)}
              />
            </g>
          )
        })}
      </svg>
      <div style={{ position: 'absolute', right: controlsRight, bottom: 12, display: 'flex', gap: 6, transition: 'right 0.2s' }}>
        <Button label="지도 확대" size="sm" elevation="low" onClick={() => zoomBy(ZOOM_STEP)}>+</Button>
        <Button label="지도 축소" size="sm" elevation="low" onClick={() => zoomBy(1 / ZOOM_STEP)}>−</Button>
        <Button label="지도 원래대로" size="sm" elevation="low" onClick={resetZoom}>원래대로</Button>
      </div>
      {hover && (
        <CountryTooltip name={hover.shape.name} data={hover.shape.data} status={hover.shape.status} x={hover.x} y={hover.y} />
      )}
    </div>
  )
}
