// 화면 고르기: 지도(map)가 기본, 주소가 #/plan이면 일정표 짜기(plan) 전체 화면
// plan을 빼려면 PlanPage import, links, 아래 PlanPage 줄을 지우면 된다 (map은 plan을 모른다)
import { useSyncExternalStore } from 'react'
import App from './map/src/App.jsx'
import PlanPage from './plan/src/PlanPage.jsx'

const links = [{ label: '일정표 짜기', href: '#/plan' }]

// 주소 # 뒤를 화면 이름으로 (라이브러리 없이, 브라우저 뒤로 가기도 된다)
const subscribe = (cb) => (window.addEventListener('hashchange', cb), () => window.removeEventListener('hashchange', cb))
const getHash = () => window.location.hash

export default function Root() {
  const isPlan = useSyncExternalStore(subscribe, getHash) === '#/plan'
  return (
    <>
      {/* 지도는 숨기기만 해서, 계획 화면에 다녀와도 확대 위치·추천 결과가 그대로 남는다 */}
      <div style={{ display: isPlan ? 'none' : 'block' }}>
        <App links={links} />
      </div>
      {isPlan && <PlanPage />}
    </>
  )
}
