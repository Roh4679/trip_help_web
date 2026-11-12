// 웹 입구: 지도(map)를 기본 화면으로 띄우고, 사이드 창 탭에 여행 계획(plan)을 끼워 넣는다
// plan을 빼려면 아래 PlanPanel import와 extraTabs 한 줄을 지우면 된다 (map은 plan을 모른다)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Theme } from '@astryxdesign/core/theme'
import { LayerProvider } from '@astryxdesign/core/Layer'
import { neutralTheme } from '@astryxdesign/theme-neutral/built'
import './map/src/index.css'
import App from './map/src/App.jsx'
import PlanPanel from './plan/src/PlanPanel.jsx'

const extraTabs = [{ value: 'plan', label: '여행 계획', content: <PlanPanel /> }]

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Theme theme={neutralTheme} mode="light">
      <LayerProvider>
        <App extraTabs={extraTabs} />
      </LayerProvider>
    </Theme>
  </StrictMode>,
)
