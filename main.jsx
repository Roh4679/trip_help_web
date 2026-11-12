// 웹 입구: 테마를 씌우고 화면 고르기(Root)를 띄운다
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Theme } from '@astryxdesign/core/theme'
import { LayerProvider } from '@astryxdesign/core/Layer'
import { neutralTheme } from '@astryxdesign/theme-neutral/built'
import './map/src/index.css'
import './shared/global.css' // 공통 글꼴(Pretendard)·디자인 토큰 — 테마 CSS 뒤에 불러와야 덮어쓴다
import Root from './Root.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Theme theme={neutralTheme} mode="light">
      <LayerProvider>
        <Root />
      </LayerProvider>
    </Theme>
  </StrictMode>,
)
