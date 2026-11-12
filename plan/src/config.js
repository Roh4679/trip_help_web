// 일정표 기준값 (PLANNER_plan.md 3장). 바꿀 값은 여기서만
export const SLOT_MIN = 30 // 칸 하나 = 30분 (스냅·길이 조절 단위)
export const DAY_START_MIN = 6 * 60 // 표 시작: 오전 6:00 (그날 0시 기준 분)
export const DEFAULT_END_HOUR = 25 // 표 끝 기본값: 새벽 1:00 (= 25시)
export const MAX_END_HOUR = 30 // [+]로 늘릴 수 있는 끝: 다음 날 오전 6:00 (하루 24시간)
export const DEFAULT_DAYS = 3 // 처음 열었을 때 여행 일수
export const MAX_DAYS = 30
export const ROW_PX = 22 // 30분 칸 하나의 높이 (화면 px)
export const DEFAULT_DURATION = 60 // 새 블록 기본 길이 (분)

// 블록 색 8가지 (데이터에는 번호 0~7로 저장). 밝은 바탕 + 진한 테두리라 검은 글씨가 잘 보인다
export const BLOCK_COLORS = [
  { name: '빨강', bg: '#ffd9d6', border: '#e57368' },
  { name: '주황', bg: '#ffe6c7', border: '#e8964a' },
  { name: '노랑', bg: '#fff3b3', border: '#d4b42a' },
  { name: '초록', bg: '#d8f3cf', border: '#5aa64a' },
  { name: '하늘', bg: '#cdeef7', border: '#3e9fc2' },
  { name: '파랑', bg: '#d6defe', border: '#5a74d8' },
  { name: '보라', bg: '#e8dafe', border: '#9068d6' },
  { name: '분홍', bg: '#fbd9ec', border: '#d0609f' },
]

// 준비물 (메모 아래 칸)
export const PACK_MAX_LEN = 20 // 준비물 이름 최대 글자 수 (넘으면 더 입력되지 않는다)
export const PACK_PILL_PX = 30 // 준비물 블록 높이 (가로는 글자 길이에 맞춤)
