// 계절 = 한국 기준 여행 시기 (PLANNING_map.md 4.4)
export const SEASON_MONTHS = {
  봄: [3, 4, 5],
  여름: [6, 7, 8],
  가을: [9, 10, 11],
  겨울: [12, 1, 2],
}

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

// 계절을 하나도 안 고르면 1년 전체
export function seasonMonths(seasons) {
  return seasons.length ? seasons.flatMap((s) => SEASON_MONTHS[s]) : ALL_MONTHS
}
