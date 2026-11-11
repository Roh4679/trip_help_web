import { riskText, safetyUrl } from '../utils/format.js'

// 여행경보 문구 + ↗. 누르면 외교부 해외안전여행 나라별 페이지를 새 탭으로 연다
export default function RiskLink({ risk, short }) {
  const text = riskText(risk)
  return (
    <a href={safetyUrl(risk)} target="_blank" rel="noreferrer" title="외교부 해외안전여행에서 보기" style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}>
      {short ? text.replace('여행경보 ', '') : text}{'00a0'}↗ {/* ↗만 다음 줄로 떨어지지 않게 */}
    </a>
  )
}
