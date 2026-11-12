import { useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Button } from '@astryxdesign/core/Button'
import { Drawer } from '@astryxdesign/core/Drawer'
import WorldMap from './components/WorldMap.jsx'
import CountryDetail from './components/CountryDetail.jsx'
import RecommendPanel from './components/RecommendPanel.jsx'
import MapLegend from './components/MapLegend.jsx'
import CountrySearch from './components/CountrySearch.jsx'
import countries from './data/countries.json'
import { recommend } from './utils/recommend.js'
import { useMedia } from './utils/useMedia.js'
import { MOBILE_QUERY } from './config.js'
import { COLOR, cardStyle } from '../../shared/tokens.js'
import AppBrand, { ToolbarDivider } from '../../shared/AppBrand.jsx'

// Dialog 안쪽은 넘치면 잘리게(overflow: hidden) 되어 있어서, 스크롤 영역은 직접 만든다. 제목줄은 그 밖에 있어 고정된다
const DRAWER_WIDTH = 360
const GAP = 12

const scrollBody = { flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overflowX: 'hidden', overflowWrap: 'anywhere', padding: 20 }

// links: 왼쪽 위에 더 붙일 다른 화면 버튼 [{ label, href }]. 입구(main.jsx)가 넘겨준다 (여행 계획 등). map은 그 화면을 모른다
export default function App({ links = [] }) {
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState(null)
  const [isPanelOpen, setPanelOpen] = useState(false)
  const isMobile = useMedia(MOBILE_QUERY)
  // 툴바 아래 끝 위치 (휴대폰에서 확대 버튼을 그 아래에 두려고). 툴바가 줄바꿈되면 다시 잰다
  const toolbarRef = useRef(null)
  const [toolbarBottom, setToolbarBottom] = useState(0)
  useEffect(() => {
    const el = toolbarRef.current
    const measure = () => setToolbarBottom(el.getBoundingClientRect().bottom)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const mapRef = useRef(null)
  // 추천 결과가 있으면 지도에서 결과 나라만 진하게 (조건을 바꾸거나 추천 패널을 닫으면 원래대로, 결과가 0곳이면 흐리게 하지 않는다)
  const highlight = useMemo(() => (results?.length ? new Set(results.map((r) => r.country.iso2)) : null), [results])

  // 추천 결과가 나오면 지도를 돌려 결과 나라들이 추천 패널에 가려지지 않게 맞추고, 결과가 사라지면 원래 위치로
  // (휴대폰은 추천 패널이 화면 전체를 덮어 지도가 안 보이므로 하지 않는다)
  useEffect(() => {
    if (isMobile) return
    if (results?.length) mapRef.current.fit(results.map((r) => r.country.iso2), DRAWER_WIDTH)
    else if (!results) mapRef.current.restore()
  }, [results, isMobile])

  // 가운데 창은 나라 상세에만 쓴다. 추천 결과는 오른쪽 추천 패널 안에 보여 준다
  const close = (open) => !open && setSelected(null)
  // 추천 패널을 닫으면 결과도 지운다 (지도 강조도 원래대로)
  const setPanel = (open) => {
    setPanelOpen(open)
    if (!open) setResults(null)
  }

  return (
    // 지도는 항상 화면 전체를 쓴다
    <div style={{ position: 'fixed', inset: 0 }}>
      <WorldMap
        ref={mapRef}
        onSelect={setSelected}
        isZoomEnabled={!selected}
        // 추천 패널이 열리면 확대 버튼을 패널 왼쪽으로 옮겨 가려지지 않게 한다
        controlsRight={isPanelOpen ? DRAWER_WIDTH + GAP : GAP}
        // 휴대폰 폭에서는 아래쪽을 범례·안내 문구에 내주고 확대 버튼을 오른쪽 위, 툴바 아래로
        controlsTop={isMobile ? toolbarBottom + 8 : null}
        highlight={highlight}
      />
      {/* 왼쪽 위: 흰 툴바 하나 — 앱 이름 | 검색창 | 여행지 추천 | 일정표 짜기. 휴대폰에서는 화면 폭을 다 쓰고 줄바꿈된다 */}
      <div
        ref={toolbarRef}
        style={{
          ...cardStyle,
          position: 'absolute',
          top: GAP,
          left: GAP,
          right: isMobile ? GAP : 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 8,
          padding: 6,
        }}
      >
        <AppBrand />
        {!isMobile && <ToolbarDivider />}
        <CountrySearch onPick={(place) => mapRef.current.focus(place)} width={isMobile ? '100%' : 260} />
        {!isMobile && <ToolbarDivider />}
        <Button label="여행지 추천" variant="primary" onClick={() => setPanelOpen(true)} />
        {links.map((l) => <Button key={l.href} label={l.label} href={l.href} variant="secondary" />)}
      </div>

      {/* 왼쪽 아래: 범례 + 안내 문구. 확대 버튼(오른쪽 아래)과 겹치지 않게 폭을 줄이고, 좁은 화면에서는 줄바꿈된다 */}
      <div
        style={{
          position: 'absolute',
          left: GAP,
          bottom: GAP,
          maxWidth: isMobile ? `calc(100% - ${GAP * 2}px)` : 'calc(100% - 240px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 6,
        }}
      >
        <MapLegend />
        <p style={{ ...cardStyle, margin: 0, padding: '6px 10px', fontSize: 12, lineHeight: 1.5, color: COLOR.textSub }}>
          정보는 참고용이에요. 출국 전 외교부 해외안전여행(0404.go.kr) 등 공식 사이트에서 꼭 확인하세요.{' '}
          <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer" style={{ color: COLOR.textMuted }}>Rates By Exchange Rate API</a>
        </p>
      </div>

      {/* 지도 위에 겹쳐 뜨는 사이드 창. 배경막 없이 띄워서 지도는 계속 움직일 수 있다. 화면이 좁으면(640px 미만) 전체 너비 */}
      <Drawer
        isOpen={isPanelOpen}
        onOpenChange={setPanel}
        label="여행지 추천"
        hasScrim={false}
        width={DRAWER_WIDTH}
        experimental={{ isFullWidthOnMobile: true }}
      >
        <RecommendPanel
          results={results}
          onSubmit={(conditions) => setResults(recommend(countries, conditions))}
          onConditionsChange={() => setResults(null)} // 조건을 바꾸면 이전 결과는 지운다
          onSelect={setSelected}
          onClose={setPanel}
        />
      </Drawer>

      {/* 휴대폰에서는 창을 화면 전체로 */}
      <Dialog
        isOpen={!!selected}
        onOpenChange={close}
        variant={isMobile ? 'fullscreen' : 'standard'}
        width={640}
        maxHeight="90dvh"
      >
        {selected && (
          <DialogHeader
            title={selected.name}
            startContent={<img src={`https://flagcdn.com/w40/${selected.iso2}.png`} alt="" width={28} />}
            onOpenChange={close}
          />
        )}
        {/* 나라가 바뀔 때마다 스크롤 영역을 새로 만들어 맨 위에서 시작한다 */}
        <div key={selected?.iso2} style={scrollBody}>
          {selected && <CountryDetail key={selected.iso2} country={selected} />}
        </div>
      </Dialog>
    </div>
  )
}
