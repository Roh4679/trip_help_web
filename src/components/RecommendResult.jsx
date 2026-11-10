import { ClickableCard } from '@astryxdesign/core/ClickableCard'
import { Badge } from '@astryxdesign/core/Badge'
import { flightText } from '../utils/format.js'

export default function RecommendResult({ results, onSelect }) {
  if (!results.length) return <p>조건에 맞는 여행지가 없어요. 조건을 바꿔보세요.</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {results.map(({ country: c, avgTemp, matchedMoods }) => (
        <ClickableCard key={c.iso2} label={`${c.name} 상세 보기`} onClick={() => onSelect(c)} elevation="low" padding={3}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <img src={`https://flagcdn.com/w80/${c.iso2}.png`} alt="" width={40} style={{ marginTop: 4 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <b style={{ fontSize: 16 }}>{c.name}</b>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Badge label={flightText(c.flight)} variant="teal" />
                <Badge label={`평균 ${avgTemp}℃`} variant="orange" />
                {matchedMoods.map((m) => <Badge key={m} label={m} variant="blue" />)}
              </div>
            </div>
          </div>
        </ClickableCard>
      ))}
    </div>
  )
}
