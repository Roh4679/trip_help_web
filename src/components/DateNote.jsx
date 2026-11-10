// 기준 날짜. 확인 전('미확인')이면 작은 회색 표시만 붙인다
export default function DateNote({ updated }) {
  if (updated !== '미확인') return <span> ({updated} 기준)</span>
  return (
    <span
      style={{
        marginLeft: 6,
        padding: '0 4px',
        fontSize: 11,
        color: '#888',
        border: '1px solid #ccc',
        borderRadius: 4,
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
      }}
    >
      미확인
    </span>
  )
}
