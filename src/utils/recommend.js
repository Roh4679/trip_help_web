import { countryStatus, riskTone } from './countryStatus.js'
import { isRainy } from './climate.js'
import { seasonMonths } from './season.js'

// 비행시간·시기·날씨는 모두 만족(AND), 분위기는 하나라도 맞으면(OR). 데이터 없는 나라와 3단계·특별여행주의보 이상(빗금)은 제외
export function recommend(countries, { maxHours, seasons, avoidRain, moods }) {
  const months = seasonMonths(seasons)
  return countries
    .filter((c) => countryStatus(c) === 'ok' && riskTone(c) < 3)
    .filter((c) => c.flight.hours <= maxHours)
    .map((c) => {
      const climate = c.climate.filter((m) => months.includes(m.month))
      return {
        country: c,
        climate,
        avgTemp: Math.round((climate.reduce((sum, m) => sum + m.temp, 0) / climate.length) * 10) / 10,
        // 계절을 안 골랐으면(1년 전체) 평균 대신 최저~최고 범위로 보여 준다
        tempRange: seasons.length ? null : [Math.round(Math.min(...climate.map((m) => m.temp))), Math.round(Math.max(...climate.map((m) => m.temp)))],
        matchedMoods: c.moods.filter((m) => moods.includes(m)),
      }
    })
    .filter((r) => !avoidRain || !r.climate.some(isRainy))
    .filter((r) => !moods.length || r.matchedMoods.length)
    .sort((a, b) => b.matchedMoods.length - a.matchedMoods.length || a.country.flight.hours - b.country.flight.hours)
}
