import { useState } from 'react'
import { Text } from '@astryxdesign/core/Text'
import { Slider } from '@astryxdesign/core/Slider'
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput'
import { Button } from '@astryxdesign/core/Button'
import { DrawerHeader } from '@astryxdesign/core/Drawer'
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout'
import moodList from '../data/moods.json'
import { SEASON_MONTHS } from '../utils/season.js'

const toggle = (list, item, on) => (on ? [...list, item] : list.filter((x) => x !== item))
const row = { display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }

// 사이드 창(Drawer) 안의 내용. 추천 받기 버튼은 아래(LayoutFooter)에 고정해서 조건이 늘어도 항상 보인다
export default function RecommendPanel({ onSubmit, onClose }) {
  const [maxHours, setMaxHours] = useState(20)
  const [seasons, setSeasons] = useState([])
  const [avoidRain, setAvoidRain] = useState(false)
  const [moods, setMoods] = useState([])

  return (
    <Layout
      header={<DrawerHeader title="여행지 추천" onOpenChange={onClose} />}
      content={
        <LayoutContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Slider
              label="비행시간"
              value={maxHours}
              onChange={setMaxHours}
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
                  <CheckboxInput key={s} label={s} value={seasons.includes(s)} onChange={(on) => setSeasons(toggle(seasons, s, on))} />
                ))}
              </div>
            </fieldset>

            <CheckboxInput label="우기 피하기" description="고른 시기에 우기인 달이 있으면 빼요" value={avoidRain} onChange={setAvoidRain} />
            {/* 시기를 안 고르면 1년 중 한 달이라도 우기면 빠져서 결과가 너무 적어진다 */}
            {avoidRain && !seasons.length && (
              <p role="status" style={{ margin: 0, padding: '8px 10px', borderRadius: 6, background: '#fff4e5', border: '1px solid #f3cf9b', fontSize: 13 }}>
                ℹ️ 여행 시기를 고르면 더 정확해요
              </p>
            )}

            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend><Text weight="semibold">분위기</Text> <Text type="supporting">하나라도 맞으면 추천</Text></legend>
              <div style={row}>
                {moodList.map((m) => (
                  <CheckboxInput key={m} label={m} value={moods.includes(m)} onChange={(on) => setMoods(toggle(moods, m, on))} />
                ))}
              </div>
            </fieldset>
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
