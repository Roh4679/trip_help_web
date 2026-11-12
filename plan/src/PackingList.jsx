import { useRef, useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { Check, Pencil, X } from 'lucide-react'
import { PACK_PILL_PX } from './config.js'
import { moveItem, dropIndex } from './packing.js'
import { COLOR, CARD } from '../../shared/tokens.js'

const CLICK_PX = 4 // 이만큼도 안 움직이고 떼면 끌기가 아니라 누르기 (챙김 켜고 끄기)

// 준비물 칸 (메모 아래). 준비물마다 알약 모양 블록: 높이는 고정, 폭은 글자 길이만큼, 줄이 차면 다음 줄로
// 누르면 챙김(체크 + 흐리게) 켜고 끄기, 끌면 이 칸 안에서만 순서 바꾸기 (일정표·보관함으로는 못 간다)
// 고치기·삭제는 마우스를 올리면(키보드는 초점이 가면) 나오는 작은 버튼으로
export default function PackingList({ items, onAdd, onEdit, onDelete, onToggle, onMove }) {
  const listRef = useRef(null)
  const [drag, setDrag] = useState(null) // { id, index(넣을 자리, 칸 밖이면 null), x, y }

  const startDrag = (e, item) => {
    if (e.button !== 0) return
    e.preventDefault()
    const origin = { x: e.clientX, y: e.clientY }
    // 끌기 시작할 때의 다른 준비물 위치 (미리보기로 순서가 바뀌어도 넣을 자리가 흔들리지 않게 처음 위치로 계산)
    const others = [...listRef.current.querySelectorAll('[data-pack-id]')]
      .filter((el) => el.dataset.packId !== item.id)
      .map((el) => el.getBoundingClientRect())
    const box = listRef.current.getBoundingClientRect()
    let moved = false
    let last = null
    const move = (ev) => {
      if (!moved && Math.hypot(ev.clientX - origin.x, ev.clientY - origin.y) < CLICK_PX) return
      moved = true
      // 준비물 칸 밖이면 놓을 자리 없음 (놓으면 원래대로)
      const inside = ev.clientX >= box.left - 8 && ev.clientX <= box.right + 8 && ev.clientY >= box.top - 8 && ev.clientY <= box.bottom + 8
      last = { id: item.id, index: inside ? dropIndex(others, ev.clientX, ev.clientY) : null, x: ev.clientX, y: ev.clientY }
      setDrag(last)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setDrag(null)
      if (!moved) onToggle(item.id)
      else if (last?.index != null) onMove(item.id, last.index)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  // 끄는 동안 놓았을 때 순서를 미리 보여 준다
  const shown = drag?.index != null ? moveItem(items, drag.id, drag.index) : items
  const dragged = drag && items.find((it) => it.id === drag.id)

  return (
    <section className="plan-box" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <b>준비물</b>
        <Button label="+ 준비물" variant="secondary" size="sm" onClick={onAdd} />
      </div>
      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: COLOR.textSub }}>챙길 물건을 추가하세요. 누르면 챙김 표시가 돼요.</p>
      ) : (
        <ul ref={listRef} aria-label="준비물 목록" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: 0, padding: 0, listStyle: 'none' }}>
          {shown.map((it) => (
            <li key={it.id} data-pack-id={it.id} className="pack-item" style={{ position: 'relative', maxWidth: '100%', opacity: drag?.id === it.id ? 0.35 : 1 }}>
              <Pill item={it} onPointerDown={(e) => startDrag(e, it)} onKeyToggle={() => onToggle(it.id)} />
              <span className="pack-actions">
                <button type="button" aria-label={`${it.text} 고치기`} title="고치기" onClick={() => onEdit(it)}>
                  <Icon icon={Pencil} size="xsm" color="secondary" />
                </button>
                <button type="button" aria-label={`${it.text} 삭제`} title="삭제" onClick={() => onDelete(it.id)}>
                  <Icon icon={X} size="xsm" color="secondary" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* 끄는 동안 커서를 따라다니는 블록 */}
      {dragged && (
        <div style={{ position: 'fixed', left: drag.x + 8, top: drag.y - PACK_PILL_PX / 2, pointerEvents: 'none', zIndex: 20, maxWidth: 240 }}>
          <Pill item={dragged} style={{ boxShadow: CARD.shadowStrong }} />
        </div>
      )}
    </section>
  )
}

// 알약 모양 준비물 블록. 칸보다 길면 끝을 …로 줄이고, 마우스를 올리면 전체 글자(title)가 보인다
function Pill({ item, onPointerDown, onKeyToggle, style }) {
  return (
    <button
      type="button"
      aria-pressed={item.packed}
      title={`${item.text}${item.packed ? ' (챙김)' : ''} · 누르면 챙김 표시, 끌면 순서 바꾸기`}
      onPointerDown={onPointerDown}
      onClick={(e) => e.detail === 0 && onKeyToggle?.()} // 키보드(Enter·Space)로 누름 (마우스는 끌기 쪽에서 처리)
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: PACK_PILL_PX,
        maxWidth: '100%',
        padding: '0 12px',
        borderRadius: PACK_PILL_PX / 2,
        border: `1px solid ${item.packed ? COLOR.border : COLOR.noticeBorder}`,
        background: item.packed ? COLOR.surfaceSub : COLOR.noticeBg,
        color: COLOR.text,
        font: 'inherit',
        fontSize: 13,
        cursor: 'grab',
        touchAction: 'none',
        opacity: item.packed ? 0.55 : 1,
        ...style,
      }}
    >
      {item.packed && <Icon icon={Check} size="xsm" color="accent" />}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{item.text}</span>
    </button>
  )
}
