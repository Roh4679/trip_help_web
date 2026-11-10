import { useState } from 'react'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Button } from '@astryxdesign/core/Button'
import { Drawer } from '@astryxdesign/core/Drawer'
import WorldMap from './components/WorldMap.jsx'
import CountryDetail from './components/CountryDetail.jsx'
import RecommendPanel from './components/RecommendPanel.jsx'
import RecommendResult from './components/RecommendResult.jsx'
import MapLegend from './components/MapLegend.jsx'
import countries from './data/countries.json'
import { recommend } from './utils/recommend.js'

// Dialog 안쪽은 넘치면 잘리게(overflow: hidden) 되어 있어서, 스크롤 영역은 직접 만든다. 제목줄은 그 밖에 있어 고정된다
const DRAWER_WIDTH = 360
const GAP = 12

const scrollBody = { flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overflowX: 'hidden', overflowWrap: 'anywhere', padding: 20 }

export default function App() {
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState(null)
  const [isPanelOpen, setPanelOpen] = useState(false)

  // 창은 하나만 쓰고 내용만 바꾼다 (Dialog 두 개를 동시에 닫고 열면 페이지가 멈췄다).
  // 추천 목록에서 연 나라를 닫으면 목록으로 돌아간다
  const close = (open) => {
    if (open) return
    if (selected) setSelected(null)
    else setResults(null)
  }

  return (
    // 지도는 항상 화면 전체를 쓴다
    <div style={{ position: 'fixed', inset: 0 }}>
      <WorldMap
        onSelect={setSelected}
        isZoomEnabled={!selected && !results}
        // 추천 패널이 열리면 확대 버튼을 패널 왼쪽으로 옮겨 가려지지 않게 한다
        controlsRight={isPanelOpen ? DRAWER_WIDTH + GAP : GAP}
      />
      <div style={{ position: 'absolute', top: GAP, left: GAP }}>
        <Button label="여행지 추천" variant="primary" elevation="med" onClick={() => setPanelOpen(true)} />
      </div>

      {/* 왼쪽 아래: 범례 + 안내 문구. 확대 버튼(오른쪽 아래)과 겹치지 않게 폭을 줄이고, 좁은 화면에서는 줄바꿈된다 */}
      <div
        style={{
          position: 'absolute',
          left: GAP,
          bottom: GAP,
          maxWidth: 'calc(100% - 240px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 6,
        }}
      >
        <MapLegend />
        <p style={{ margin: 0, padding: '2px 6px', fontSize: 12, lineHeight: 1.5, color: '#444', background: 'rgba(255,255,255,0.8)', borderRadius: 4 }}>
          정보는 참고용이에요. 출국 전 외교부 해외안전여행(0404.go.kr) 등 공식 사이트에서 꼭 확인하세요.
        </p>
      </div>

      {/* 지도 위에 겹쳐 뜨는 사이드 창. 배경막 없이 띄워서 지도는 계속 움직일 수 있다. 화면이 좁으면(640px 미만) 전체 너비 */}
      <Drawer
        isOpen={isPanelOpen}
        onOpenChange={setPanelOpen}
        label="여행지 추천"
        hasScrim={false}
        width={DRAWER_WIDTH}
        experimental={{ isFullWidthOnMobile: true }}
      >
        <RecommendPanel onSubmit={(conditions) => setResults(recommend(countries, conditions))} onClose={setPanelOpen} />
      </Drawer>

      <Dialog isOpen={!!selected || !!results} onOpenChange={close} width={selected ? 640 : 520} maxHeight="90dvh">
        {selected ? (
          <DialogHeader
            title={selected.name}
            startContent={<img src={`https://flagcdn.com/w40/${selected.iso2}.png`} alt="" width={28} />}
            endContent={results && <Button label="목록으로" size="sm" variant="ghost" onClick={() => setSelected(null)} />}
            onOpenChange={close}
          />
        ) : (
          <DialogHeader title="추천 여행지" subtitle={results && `${results.length}곳`} onOpenChange={close} />
        )}
        {/* 목록 ↔ 상세가 바뀔 때마다 스크롤 영역을 새로 만들어 맨 위에서 시작한다 (목록을 내린 채 카드를 누르면 상세가 중간부터 보였다) */}
        <div key={selected ? selected.iso2 : 'results'} style={scrollBody}>
          {selected ? (
            <CountryDetail key={selected.iso2} country={selected} />
          ) : (
            results && <RecommendResult results={results} onSelect={setSelected} />
          )}
        </div>
      </Dialog>
    </div>
  )
}
