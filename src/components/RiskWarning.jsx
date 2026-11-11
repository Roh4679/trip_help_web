import { WARNING_COLORS } from '../config.js'
import { riskTone } from '../utils/countryStatus.js'
import { safetyUrl, warningText } from '../utils/format.js'

// 3단계·특별여행주의보 나라: 정보는 보여 주되 눈에 띄는 빨간 경고
// 상세 창 맨 위 띠. 누르면 해외안전여행 나라별 페이지를 새 탭으로
export default function RiskWarning({ country: c, compact }) {
  if (riskTone(c) !== 3) return null
  const style = { color: WARNING_COLORS.text, fontWeight: 700 }
  if (compact) return <div style={style}>{warningText(c.risk)}</div> // 메모지용 (누를 수 없음)
  return (
    <a
      href={safetyUrl(c.risk)}
      target="_blank"
      rel="noreferrer"
      title="외교부 해외안전여행에서 보기"
      style={{ ...style, display: 'block', padding: '10px 14px', background: WARNING_COLORS.background, border: `1px solid ${WARNING_COLORS.border}`, borderRadius: 8, textDecoration: 'none', wordBreak: 'keep-all' }}
    >
      {`${warningText(c.risk)}\u00a0↗`}
    </a>
  )
}
