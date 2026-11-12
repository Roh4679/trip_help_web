import { Button } from '@astryxdesign/core/Button'
import BlockCard from './BlockCard.jsx'

// 블록 보관함: 새 블록을 만드는 곳이자, 표에서 잠시 빼 둔 블록을 두는 곳 (day가 null인 블록)
export default function Storage({ blocks, onNew, onEdit }) {
  const stored = blocks.filter((b) => b.day == null)
  return (
    <aside className="plan-box" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <b>블록 보관함</b>
      <Button label="+ 새 블록" variant="secondary" size="sm" width="100%" onClick={onNew} />
      {stored.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: '#666' }}>블록을 만들어 표로 끌어다 놓으세요.</p>
      ) : (
        stored.map((b) => <BlockCard key={b.id} block={b} onClick={() => onEdit(b)} />)
      )}
    </aside>
  )
}
