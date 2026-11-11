import { RISK_LEVEL_BLOCK, BLOCK_SPECIAL_WARNING } from '../config.js'

// 'danger' > 'none' > 'ok'
export function countryStatus(data) {
  const risk = data?.risk
  // blocked: 여행경보와 별개로 방문이 제한된 곳 (예: 북한)
  if (risk?.level >= RISK_LEVEL_BLOCK || (BLOCK_SPECIAL_WARNING && risk?.special) || risk?.blocked) return 'danger'
  if (!data?.climate) return 'none'
  return 'ok'
}

// 지도·핀 색 단계: 0·1·2, 3(특별여행주의보·3단계, 빗금), 4(4단계·방문 제한, 빗금), 'none'(데이터 없음)
export function riskTone(data) {
  const risk = data?.risk
  if (risk?.blocked || risk?.level >= 4) return 4
  if (countryStatus(data) === 'danger') return 3
  if (!data?.climate) return 'none'
  return Math.min(2, Math.floor(risk?.level ?? 0))
}
