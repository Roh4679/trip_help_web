// 웹 입구: 테마를 씌우고 화면 고르기(Root)를 띄운다
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Theme } from '@astryxdesign/core/theme'
import { LayerProvider } from '@astryxdesign/core/Layer'
import { neutralTheme } from '@astryxdesign/theme-neutral/built'
import './map/src/index.css'
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
