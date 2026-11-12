// 일정표 기준값 (PLANNER_plan.md 3장). 바꿀 값은 여기서만
export const SLOT_MIN = 30 // 칸 하나 = 30분 (스냅·길이 조절 단위)
export const DAY_START_MIN = 6 * 60 // 표 시작: 오전 6:00 (그날 0시 기준 분)
export const DEFAULT_END_HOUR = 25 // 표 끝 기본값: 새벽 1:00 (= 25시)
export const MAX_END_HOUR = 30 // [+]로 늘릴 수 있는 끝: 다음 날 오전 6:00 (하루 24시간)
export const DEFAULT_DAYS = 3 // 처음 열었을 때 여행 일수
export const MAX_DAYS = 30
export const ROW_PX = 22 // 30분 칸 하나의 높이 (화면 px)
