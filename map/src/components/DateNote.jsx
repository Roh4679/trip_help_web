import { COLOR } from '../../../shared/tokens.js'
// 기준 날짜. 확인 전('미확인')이면 작은 회색 표시만 붙인다
export default function DateNote({ updated }) {
  // 날짜가 중간에서 줄바꿈되지 않게 괄호 묶음은 한 덩어리로
  if (updated !== '미확인') return <> <span style={{ whiteSpace: 'nowrap' }}>({updated} 기준)</span></>
  return (
    <span
      style={{
        marginLeft: 6,
        padding: '0 4px',
        fontSize: 11,
        color: COLOR.textMuted,
        border: `1px solid ${COLOR.borderStrong}`,
        borderRadius: 4,
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
      }}
    >
      미확인
    </span>
  )
}
