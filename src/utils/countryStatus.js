import { RISK_LEVEL_BLOCK } from '../config.js'

// 'danger' > 'none' > 'ok'
export function countryStatus(data) {
  if (data?.risk?.level >= RISK_LEVEL_BLOCK) return 'danger'
  if (!data?.climate) return 'none'
  return 'ok'
}
