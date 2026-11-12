import { Icon } from '@astryxdesign/core/Icon'
import { Earth } from 'lucide-react'
import { COLOR } from './tokens.js'

// 앱 이름: 아이콘 + "여행지 도우미". 지도 툴바와 일정표 머리말에 같이 쓴다. 누르면 지도 화면으로
export default function AppBrand() {
  return (
    <a href="#/" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px', color: COLOR.primary, fontWeight: 700, fontSize: 15, textDecoration: 'none', whiteSpace: 'nowrap' }}>
      <Icon icon={Earth} size="md" color="accent" />
      여행지 도우미
    </a>
  )
}

// 툴바 안 칸 나누기 세로선
export function ToolbarDivider() {
  return <span aria-hidden style={{ width: 1, alignSelf: 'stretch', margin: '4px 2px', background: COLOR.border }} />
}
