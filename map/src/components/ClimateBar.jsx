import { Tooltip } from '@astryxdesign/core/Tooltip'
import { Text } from '@astryxdesign/core/Text'
import { isRainy, tempColor } from '../utils/climate.js'
import { COLOR } from '../../../shared/tokens.js'

const ICON_H = 18
const BAR_H = 8

// 칸 가운데 지점마다 색을 찍어 칸 사이가 그라데이션으로 이어지게 한다
function gradient(colors) {
  return `linear-gradient(to right, ${colors.map((c, i) => `${c} ${((i + 0.5) / colors.length) * 100}%`).join(', ')})`
}

export default function ClimateBar({ climate, city, selectedMonth, onSelectMonth }) {
  return (
    <div>
      <Text type="supporting">{city} 기준 · 달을 누르면 옷차림이 바뀌어요</Text>
      <div className="climate-months" style={{ position: 'relative', marginTop: 6 }}>
        {/* 얇은 막대는 뒤에 한 줄로 깔고, 그 위에 달마다 (우산 + 막대 + 글자) 전체를 누를 수 있는 버튼을 올린다 */}
        <div
          style={{
            position: 'absolute',
            top: ICON_H,
            left: 0,
            right: 0,
            height: BAR_H,
            borderRadius: BAR_H / 2,
            background: gradient(climate.map((m) => tempColor(m.temp))),
          }}
        />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
          {climate.map((m) => {
            const selected = m.month === selectedMonth
            return (
              <Tooltip key={m.month} content={`${m.month}월 · 평균 ${m.temp}℃ · 강수량 ${m.rain}mm`}>
                <button
                  type="button"
                  aria-label={`${m.month}월`}
                  aria-pressed={selected}
                  onClick={() => onSelectMonth(m.month)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  <span aria-hidden style={{ height: ICON_H, fontSize: 11, lineHeight: `${ICON_H}px` }}>{isRainy(m) ? '☂️' : ''}</span>
                  <span
                    style={{
                      alignSelf: 'stretch',
                      height: BAR_H,
                      margin: '0 1px',
                      borderRadius: 3,
                      boxShadow: selected ? `0 0 0 2px ${COLOR.primary}` : 'none', // 고른 달: 대표색
                    }}
                  />
                  <span className="climate-month" style={{ fontSize: 12, marginTop: 4, fontWeight: selected ? 700 : 400 }}>{m.month}</span>
                </button>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </div>
  )
}
