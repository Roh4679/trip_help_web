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

// 확인 전인 값은 updated에 '미확인'이 들어 있다
export function dateText(updated) {
  return updated === '미확인' ? '날짜 미확인' : `${updated} 기준`
}

export function riskText({ level, label, updated }) {
  const date = dateText(updated)
  return level ? `여행경보 ${level}단계 ${label} · ${date}` : `여행경보 없음 · ${date}`
}
