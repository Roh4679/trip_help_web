function hoursText(hours) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m ? `${h}시간 ${m}분` : `${h}시간`
}

export function flightText({ direct, hours, transitNote }) {
  if (direct) return `직항 약 ${hoursText(hours)}`
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
export function riskText({ level, label }) {
  return level ? `여행경보 ${level}단계 ${label}` : '여행경보 없음'
}
