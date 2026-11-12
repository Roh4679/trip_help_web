import { ClickableCard } from '@astryxdesign/core/ClickableCard'
import { Badge } from '@astryxdesign/core/Badge'
import { flightText } from '../utils/format.js'
import { tempColor, tempTextColor } from '../utils/climate.js'

// 기온 배지: 기후 막대와 같은 색 기준(파랑~빨강, config.js TEMP_COLORS). 범위면 최저 색 → 최고 색 그라데이션
function TempBadge({ temp, range, label }) {
  const background = range ? `linear-gradient(90deg, ${tempColor(range[0])}, ${tempColor(range[1])})` : tempColor(temp)
  return (
    <span style={{ padding: '1px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600, lineHeight: '20px', background, color: tempTextColor(temp), whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

export default function RecommendResult({ results, onSelect }) {
  if (!results.length) return <p>조건에 맞는 여행지가 없어요. 조건을 바꿔보세요.</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {results.map(({ country: c, avgTemp, tempRange, matchedMoods }) => (
        <ClickableCard key={c.iso2} label={`${c.name} 상세 보기`} onClick={() => onSelect(c)} elevation="low" padding={3}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <img src={`https://flagcdn.com/w80/${c.iso2}.png`} alt="" width={40} style={{ marginTop: 4 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <b style={{ fontSize: 16 }}>{c.name}</b>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Badge label={flightText(c.flight)} variant="neutral" />
                {/* 계절을 안 골랐으면 1년 최저~최고 */}
                <TempBadge temp={avgTemp} range={tempRange} label={tempRange ? `${tempRange[0]}~${tempRange[1]}℃` : `평균 ${avgTemp}℃`} />
                {matchedMoods.map((m) => <Badge key={m} label={m} variant="neutral" />)}
              </div>
            </div>
          </div>
        </ClickableCard>
      ))}
    </div>
  )
}
