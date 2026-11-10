import { countryStatus } from './countryStatus.js'
import { isRainy } from './climate.js'
import { seasonMonths } from './season.js'

// 비행시간·시기·날씨는 모두 만족(AND), 분위기는 하나라도 맞으면(OR). 위험·데이터 없는 나라는 제외
export function recommend(countries, { maxHours, seasons, avoidRain, moods }) {
  const months = seasonMonths(seasons)
  return countries
    .filter((c) => countryStatus(c) === 'ok')
    .filter((c) => c.flight.hours <= maxHours)
    .map((c) => {
      const climate = c.climate.filter((m) => months.includes(m.month))
      return {
        country: c,
        climate,
        avgTemp: Math.round((climate.reduce((sum, m) => sum + m.temp, 0) / climate.length) * 10) / 10,
        matchedMoods: c.moods.filter((m) => moods.includes(m)),
      }
    })
    .filter((r) => !avoidRain || !r.climate.some(isRainy))
    .filter((r) => !moods.length || r.matchedMoods.length)
    .sort((a, b) => b.matchedMoods.length - a.matchedMoods.length || a.country.flight.hours - b.country.flight.hours)
}
