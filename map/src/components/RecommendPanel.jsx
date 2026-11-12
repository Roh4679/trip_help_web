import { useEffect, useRef, useState } from 'react'
import { Text } from '@astryxdesign/core/Text'
import { Slider } from '@astryxdesign/core/Slider'
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput'
import { Button } from '@astryxdesign/core/Button'
import { DrawerHeader } from '@astryxdesign/core/Drawer'
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout'
import moodList from '../data/moods.json'
import { SEASON_MONTHS } from '../utils/season.js'
import RecommendResult from './RecommendResult.jsx'
import { COLOR } from '../../../shared/tokens.js'
import { Icon } from '@astryxdesign/core/Icon'

const toggle = (list, item, on) => (on ? [...list, item] : list.filter((x) => x !== item))
const row = { display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }

// 사이드 창(Drawer) 안의 내용. 추천 받기 버튼은 아래(LayoutFooter)에 고정해서 조건이 늘어도 항상 보인다
// 결과(results)는 조건 아래에 카드 목록으로. 카드를 누르면 onSelect(나라) → 상세 창, 조건을 바꾸면 onConditionsChange → 결과를 지운다
export default function RecommendPanel({ results, onSubmit, onConditionsChange, onSelect, onClose }) {
  const [maxHours, setMaxHours] = useState(20)
  const [seasons, setSeasons] = useState([])
  const [avoidRain, setAvoidRain] = useState(false)
  const [moods, setMoods] = useState([])
  // 조건을 바꿀 때마다 이전 결과를 지운다
  const change = (set) => (value) => {
    set(value)
    onConditionsChange()
  }

  // 결과가 나오면 결과 쪽으로 스크롤
  const resultsRef = useRef(null)
  useEffect(() => {
    if (results) resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [results])

  return (
    <Layout
      header={<DrawerHeader title="여행지 추천" onOpenChange={onClose} />}
      content={
        <LayoutContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Slider
              label="비행시간"
              value={maxHours}
              onChange={change(setMaxHours)}
              min={1}
              max={20}
              formatValue={(v) => `${v}시간 이하`}
              valueDisplay="text"
              width="100%"
            />

            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend><Text weight="semibold">여행 시기</Text></legend>
              <div style={row}>
                {Object.keys(SEASON_MONTHS).map((s) => (
                  <CheckboxInput key={s} label={s} value={seasons.includes(s)} onChange={(on) => change(setSeasons)(toggle(seasons, s, on))} />
                ))}
              </div>
            </fieldset>

            <CheckboxInput label="우기 피하기" description="고른 시기에 우기인 달이 있으면 빼요" value={avoidRain} onChange={change(setAvoidRain)} />
            {/* 시기를 안 고르면 1년 중 한 달이라도 우기면 빠져서 결과가 너무 적어진다 */}
            {avoidRain && !seasons.length && (
              <p role="status" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0, padding: '8px 10px', borderRadius: 6, background: COLOR.noticeBg, border: `1px solid ${COLOR.noticeBorder}`, fontSize: 13 }}>
                <Icon icon="info" size="sm" color="accent" /> 여행 시기를 고르면 더 정확해요
              </p>
            )}

            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend><Text weight="semibold">분위기</Text> <Text type="supporting">하나라도 맞으면 추천</Text></legend>
              <div style={row}>
                {moodList.map((m) => (
                  <CheckboxInput key={m} label={m} value={moods.includes(m)} onChange={(on) => change(setMoods)(toggle(moods, m, on))} />
                ))}
              </div>
            </fieldset>

            {/* 추천 결과: 조건 아래 카드 목록 */}
            {results && (
              <section ref={resultsRef} style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: `1px solid ${COLOR.border}` }}>
                <Text weight="semibold">추천 여행지 {results.length}곳</Text>
                <RecommendResult results={results} onSelect={onSelect} />
              </section>
            )}
          </div>
        </LayoutContent>
      }
      footer={
        <LayoutFooter>
          <Button label="추천 받기" variant="primary" width="100%" onClick={() => onSubmit({ maxHours, seasons, avoidRain, moods })} />
        </LayoutFooter>
      }
    />
  )
}
