import { BLOCK_COLORS } from './config.js'
import { timeLabel, durationLabel } from './time.js'

// 블록 한 개의 모양. 보관함과 표에서 같이 쓴다. 표 안이면 이름 아래 시간(10:00~11:30)도 보여 준다
export default function BlockCard({ block, onClick, style }) {
  const c = BLOCK_COLORS[block.color] ?? BLOCK_COLORS[0]
  const placed = block.day != null
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${block.title} (눌러서 고치기)`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        padding: '4px 8px',
        borderRadius: 6,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderLeftWidth: 4,
        color: '#222',
        font: 'inherit',
        fontSize: 13,
        textAlign: 'left',
        cursor: 'pointer',
        overflow: 'hidden',
        ...style,
      }}
    >
      <b style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{block.title}</b>
      {placed ? (
        <span style={{ fontSize: 11 }}>{timeLabel(block.start)}~{timeLabel(block.start + block.duration)}</span>
      ) : (
        <span style={{ fontSize: 11, color: '#555' }}>{durationLabel(block.duration)}</span>
      )}
    </button>
  )
}
