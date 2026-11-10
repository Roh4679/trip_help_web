import { COLORS, DANGER_HATCH } from '../config.js'

// 지도 빗금과 같은 모양을 CSS로 그린다
const hatch = `repeating-linear-gradient(45deg, ${COLORS.dangerHatch} 0 ${DANGER_HATCH.width}px, ${COLORS.danger} ${DANGER_HATCH.width}px ${DANGER_HATCH.gap}px)`

const ITEMS = [
  { label: '볼 수 있어요', background: COLORS.ok },
  { label: '준비 중이에요', background: COLORS.none },
  { label: '여행 위험·방문 제한', background: hatch },
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
    </ul>
  )
}
