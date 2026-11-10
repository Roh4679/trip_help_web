import { flightText, timeDiffText, riskText } from '../utils/format.js'

const WIDTH = 300
const GAP = 14

// HoverCard는 SVG <path>를 감싸면 나라가 사라져서 커서를 따라다니는 div로 직접 만든다
export default function CountryTooltip({ name, data, status, x, y }) {
  const left = x + GAP + WIDTH > window.innerWidth ? x - GAP - WIDTH : x + GAP
  return (
    <div
      role="tooltip"
      style={{
        position: 'fixed',
        left,
        top: y + GAP,
        width: WIDTH,
        padding: '10px 12px',
        background: '#fffbe6',
        border: '1px solid #e8dfb0',
        borderRadius: 6,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: 13,
        lineHeight: 1.6,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 }}>
        {data?.iso2 && <img src={`https://flagcdn.com/w40/${data.iso2}.png`} alt="" width={24} />}
        {name}
      </div>
      {status === 'danger' && <div>여행경보 {data.risk.level}단계 · 정보를 제공하지 않아요</div>}
      {status === 'ok' && (
        <>
          <div>{riskText(data.risk)}</div>
          <div>{flightText(data.flight)}</div>
          <div>{timeDiffText(data.timeDiff, data.dstTimeDiff)}</div>
        </>
      )}
    </div>
  )
}
