import { useState } from 'react'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Button } from '@astryxdesign/core/Button'
import { PACK_MAX_LEN } from './config.js'
import { charCount, clampText } from './packing.js'
import { COLOR } from '../../shared/tokens.js'

// 준비물 추가·고치기 창. item이 있으면 고치기. 글자 수는 PACK_MAX_LEN까지만 들어가고(넘으면 더 입력 안 됨), "8/20"처럼 보여 준다
// 열 때마다 새로 그리도록 부모가 key를 바꿔 준다 (입력값 초기화)
export default function PackDialog({ item, onSave, onClose }) {
  const [text, setText] = useState(item?.text ?? '')
  const count = charCount(text)
  const canSave = text.trim() !== ''
  const save = () => canSave && onSave(text)

  return (
    <Dialog isOpen onOpenChange={(open) => !open && onClose()} width={360}>
      <DialogHeader title={item ? '준비물 고치기' : '준비물 추가'} onOpenChange={(open) => !open && onClose()} />
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 20 }}
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <TextInput label="준비물" placeholder="예: 여권, 보조배터리" value={text} onChange={(v) => setText(clampText(v))} hasAutoFocus />
        {/* 글자 수: 다 차면 대표색으로 */}
        <span aria-live="polite" style={{ alignSelf: 'flex-end', fontSize: 12, color: count >= PACK_MAX_LEN ? COLOR.primary : COLOR.textSub, fontWeight: count >= PACK_MAX_LEN ? 700 : 400 }}>
          {count}/{PACK_MAX_LEN}
        </span>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button label="취소" variant="secondary" onClick={onClose} />
          <Button label={item ? '저장' : '추가'} variant="primary" type="submit" isDisabled={!canSave} />
        </div>
      </form>
    </Dialog>
  )
}
