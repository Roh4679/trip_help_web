import { RISK_LEVEL_BLOCK, BLOCK_SPECIAL_WARNING } from '../config.js'

// 'danger' > 'none' > 'ok'
export function countryStatus(data) {
  const risk = data?.risk
  if (risk?.level >= RISK_LEVEL_BLOCK || (BLOCK_SPECIAL_WARNING && risk?.special)) return 'danger'
  if (!data?.climate) return 'none'
  return 'ok'
}
