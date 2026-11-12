import { Button } from '@astryxdesign/core/Button'
import { ROW_PX } from './config.js'
import BlockCard from './BlockCard.jsx'
import { COLOR } from '../../shared/tokens.js'

// 블록 보관함: 새 블록을 만드는 곳이자, 표에서 잠시 빼 둔 블록을 두는 곳 (day가 null인 블록)
// 표의 블록을 여기로 끌어 놓으면 보관함에 들어온다 (data-plan-storage)
export default function Storage({ blocks, onNew, onEdit, onDragStart, isDropTarget }) {
  const stored = blocks.filter((b) => b.day == null)
  return (
    <aside
      data-plan-storage
      className="plan-box"
      style={{ display: 'flex', flexDirection: 'column', gap: 8, outline: isDropTarget ? `2px dashed ${COLOR.primary}` : 'none', outlineOffset: -2 }}
    >
      <b>블록 보관함</b>
      <Button label="+ 새 블록" variant="secondary" size="sm" width="100%" onClick={onNew} />
      {stored.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: COLOR.textSub }}>블록을 만들어 표로 끌어다 놓으세요.</p>
      ) : (
        stored.map((b) => <BlockCard key={b.id} block={b} onPointerDown={(e) => onDragStart(e, b, ROW_PX / 2)} onEdit={() => onEdit(b)} />)
      )}
    </aside>
  )
}
