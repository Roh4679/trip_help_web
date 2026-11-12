import { SLOT_MIN, DAY_START_MIN } from './config.js'

// 그날 0시 기준 분 → "6:00", 자정 이후는 같은 날의 연장으로 "0:00", "1:00"
export function timeLabel(min) {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

// 표의 30분 칸 시작 시각 목록: 6:00, 6:30, … 끝 시간 직전까지
export function slots(endHour) {
  const out = []
  for (let m = DAY_START_MIN; m < endHour * 60; m += SLOT_MIN) out.push(m)
  return out
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 출발일("2026-04-08") + 몇째 날(0부터) → { title: "1일차", date: "4월 8일 (수)" }
export function dayLabel(startDate, index) {
  const [y, mo, d] = startDate.split('-').map(Number)
  const date = new Date(y, mo - 1, d + index) // 달·해가 넘어가도 Date가 맞춰 준다
  return { title: `${index + 1}일차`, date: `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})` }
}

// 오늘 날짜 "YYYY-MM-DD" (기기 시간대 기준)
export function todayISO(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
