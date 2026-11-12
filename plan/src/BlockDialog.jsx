import { useState } from 'react'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Button } from '@astryxdesign/core/Button'
import { BLOCK_COLORS } from './config.js'

// 블록 만들기·고치기 창. block이 있으면 고치기(삭제 버튼 포함), 없으면 새로 만들기
// 열 때마다 새로 그려지도록 부모가 key를 바꿔 준다 (입력값 초기화)
export default function BlockDialog({ isOpen, block, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(block?.title ?? '')
  const [color, setColor] = useState(block?.color ?? 0)
  const canSave = title.trim() !== ''
  const save = () => canSave && onSave({ title: title.trim(), color })

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()} width={380}>
      <DialogHeader title={block ? '블록 고치기' : '새 블록'} onOpenChange={(open) => !open && onClose()} />
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }}
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <TextInput label="이름" placeholder="예: 점심 먹기, 박물관" value={title} onChange={setTitle} hasAutoFocus />

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>색</legend>
          <div role="radiogroup" aria-label="색" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {BLOCK_COLORS.map((c, i) => (
              <button
                key={c.name}
                type="button"
                role="radio"
                aria-checked={color === i}
                aria-label={c.name}
                title={c.name}
                onClick={() => setColor(i)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  background: c.bg,
                  border: `2px solid ${c.border}`,
                  outline: color === i ? '3px solid #222' : 'none',
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </fieldset>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {block && <Button label="삭제" variant="ghost" onClick={onDelete} />}
          <span style={{ flex: 1 }} />
          <Button label="취소" variant="secondary" onClick={onClose} />
          <Button label={block ? '저장' : '만들기'} variant="primary" type="submit" isDisabled={!canSave} />
        </div>
      </form>
    </Dialog>
  )
}
