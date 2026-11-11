import { SAFETY_SITE, SAFETY_COUNTRY_URL } from '../config.js'

function hoursText(hours) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m ? `${h}시간 ${m}분` : `${h}시간`
}

export function flightText({ direct, hours, transitNote }) {
  if (direct) return `직항 약 ${hoursText(hours)}${transitNote ? ` (${transitNote})` : ''}`
  return `직항 없음 · 최단 약 ${hoursText(hours)}${transitNote ? ` (${transitNote})` : ''}`
}

function diffText(diff) {
  if (diff === 0) return '한국과 시차 없음'
  return `한국보다 ${Math.abs(diff)}시간 ${diff < 0 ? '느림' : '빠름'}`
}

export function timeDiffText(timeDiff, dstTimeDiff) {
  const base = diffText(timeDiff)
  if (dstTimeDiff == null) return base
  return `${base} (서머타임 시 ${diffText(dstTimeDiff).replace('한국보다 ', '')})`
}

// 위험 국가(빗금)의 메모지·토스트 문구
export function dangerText({ level, special, message }) {
  if (message) return message // 예: 북한 "방문하려면 통일부 승인 필요"
  return `${special ? '특별여행주의보' : `여행경보 ${level}단계`} · 정보를 제공하지 않아요`
}

// 기준 날짜는 DateNote 컴포넌트가 따로 붙인다
// 지역마다 다르면(mixed) 범위만: "지역별 상이 (1~4단계)". 2.5 = 특별여행주의보
export function riskText({ level, label, mixed, range }) {
  if (mixed) {
    const [a, b] = range
    if (a % 1 || b % 1 || a === 0) {
      const name = (n) => (n === 0 ? '없음' : n % 1 ? '특별여행주의보' : `${n}단계`)
      return `지역별 상이 (${name(a)}~${name(b)})`
    }
    return `지역별 상이 (${a}~${b}단계)`
  }
  return level ? `여행경보 ${level}단계 ${label}` : '여행경보 없음'
}

// 해외안전여행 나라별 페이지. 나라가 아닌 곳(괌 등)은 데이터의 safetyId가 속한 나라(미국) 번호
export function safetyUrl(risk) {
  return risk?.safetyId ? SAFETY_COUNTRY_URL.replace('{id}', risk.safetyId) : SAFETY_SITE
}
