import { RISK_LEVEL_BLOCK, BLOCK_SPECIAL_WARNING } from '../config.js'

// 'danger' > 'none' > 'ok'
export function countryStatus(data) {
  const risk = data?.risk
  // blocked: 여행경보와 별개로 방문이 제한된 곳 (예: 북한)
  if (risk?.level >= RISK_LEVEL_BLOCK || (BLOCK_SPECIAL_WARNING && risk?.special) || risk?.blocked) return 'danger'
  if (!data?.climate) return 'none'
  return 'ok'
}
