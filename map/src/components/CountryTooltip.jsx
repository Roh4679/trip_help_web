import { flightText, timeDiffText, placeNotice, shortRiskText } from '../utils/format.js'
import RiskWarning from './RiskWarning.jsx'
import { COLOR } from '../../../shared/tokens.js'

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
        // 앱 전체와 같은 흰 카드 (Astryx 테마 색을 쓰고, 없으면 흰색)
        background: COLOR.surface,
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
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
      {status !== 'ok' && <div>{placeNotice({ data, status }).detail}</div>}
      {status === 'ok' && (
        <>
          <RiskWarning country={data} compact />
          {/* 메모지는 누를 수 없으니 밑줄·↗ 없이 짧게. 날짜·지역 설명은 상세 창에서 */}
          <div>{shortRiskText(data.risk)}</div>
          <div>{flightText(data.flight)}</div>
          <div>{timeDiffText(data.timeDiff, data.dstTimeDiff)}</div>
        </>
      )}
    </div>
  )
}
