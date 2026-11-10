import { useState } from 'react'
import { Text } from '@astryxdesign/core/Text'
import { Slider } from '@astryxdesign/core/Slider'
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput'
import { Button } from '@astryxdesign/core/Button'
import moodList from '../data/moods.json'
import { SEASON_MONTHS } from '../utils/season.js'

const toggle = (list, item, on) => (on ? [...list, item] : list.filter((x) => x !== item))
const row = { display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }

export default function RecommendPanel({ onSubmit }) {
  const [maxHours, setMaxHours] = useState(20)
  const [seasons, setSeasons] = useState([])
  const [avoidRain, setAvoidRain] = useState(false)
  const [moods, setMoods] = useState([])

  return (
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

      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend><Text weight="semibold">분위기</Text> <Text type="supporting">하나라도 맞으면 추천</Text></legend>
        <div style={row}>
          {moodList.map((m) => (
            <CheckboxInput key={m} label={m} value={moods.includes(m)} onChange={(on) => setMoods(toggle(moods, m, on))} />
          ))}
        </div>
      </fieldset>

      <Button label="추천 받기" variant="primary" width="100%" onClick={() => onSubmit({ maxHours, seasons, avoidRain, moods })} />
    </div>
  )
}
