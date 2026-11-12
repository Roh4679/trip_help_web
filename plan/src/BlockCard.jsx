import { BLOCK_COLORS } from './config.js'
import { timeLabel, durationLabel } from './time.js'

// 블록 한 개의 모양. 보관함과 표에서 같이 쓴다. 표 안이면 이름과 시간(10:00~11:30)을 함께 보여 준다
// 마우스로 누르면 onPointerDown(끌기 시작, 안 움직이고 떼면 고치기), 키보드(Enter·Space)로 누르면 onEdit
// compact: 30분짜리처럼 낮은 블록은 이름과 시간을 한 줄로
export default function BlockCard({ block, onPointerDown, onEdit, compact, style }) {
  const c = BLOCK_COLORS[block.color] ?? BLOCK_COLORS[0]
  const placed = block.day != null
  const time = placed ? `${timeLabel(block.start)}~${timeLabel(block.start + block.duration)}` : durationLabel(block.duration)
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onClick={(e) => e.detail === 0 && onEdit?.()} // detail 0 = 키보드로 누름 (마우스 누르기는 끌기 쪽에서 처리)
      title={`${block.title} · ${time} (끌어서 옮기기, 눌러서 고치기)`}
      style={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        alignItems: compact ? 'center' : 'flex-start',
        gap: compact ? 6 : 0,
        width: '100%',
        padding: compact ? '0 6px' : '3px 8px',
        borderRadius: 6,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderLeftWidth: 4,
        color: '#222',
        font: 'inherit',
        fontSize: 13,
        lineHeight: 1.3,
        textAlign: 'left',
        cursor: 'grab',
        overflow: 'hidden',
        touchAction: 'none',
        ...style,
      }}
    >
      <b style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{block.title}</b>
      <span style={{ fontSize: 11, color: '#444', whiteSpace: 'nowrap' }}>{time}</span>
    </button>
  )
}
