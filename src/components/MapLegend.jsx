import { COLORS, RISK_COLORS, DANGER_HATCH, PIN_COLORS } from '../config.js'
import { PIN_PATH } from '../utils/places.js'

// 지도 빗금과 같은 모양을 CSS로 그린다
const hatch = ({ base, hatch: line }) =>
  `repeating-linear-gradient(45deg, ${line} 0 ${DANGER_HATCH.width}px, ${base} ${DANGER_HATCH.width}px ${DANGER_HATCH.gap}px)`

const ITEMS = [
  { label: '없음', background: RISK_COLORS[0] },
  { label: '1단계', background: RISK_COLORS[1] },
  { label: '2단계', background: RISK_COLORS[2] },
  { label: '3단계·특별', background: hatch(RISK_COLORS[3]) }, // 정보는 보여 주되 경고, 추천에서 뺀다
  { label: '4단계(정보 제공 안 함)', background: hatch(RISK_COLORS[4]) },
  { label: '준비 중', background: COLORS.none },
  { label: '출발지', background: COLORS.home },
]

export default function MapLegend() {
  return (
    <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', margin: 0, padding: '4px 8px', listStyle: 'none', fontSize: 12, background: 'rgba(255,255,255,0.8)', borderRadius: 6 }}>
      {ITEMS.map((it) => (
        <li key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span aria-hidden style={{ width: 12, height: 12, borderRadius: 2, background: it.background, border: '1px solid rgba(0,0,0,0.15)' }} />
          {it.label}
        </li>
      ))}
      {/* 핀은 지도에서 잘 안 보이는 작은 곳(싱가포르, 홍콩 등)에만 꽂는다. 색은 위와 같은 기준 */}
      <li style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <svg aria-hidden width={12} height={14} viewBox="-7 -19 14 20">
          <path d={PIN_PATH} fill={PIN_COLORS[1]} stroke="#fff" />
        </svg>
        작은 곳 (색 기준 같음)
      </li>
    </ul>
  )
}
