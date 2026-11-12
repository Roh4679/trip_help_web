// 환율 API(open.er-api.com, KRW 기준) 응답을 다루는 순수 함수. 브라우저(useRates)와 빌드 스크립트가 같이 쓴다

// 응답 → { rates: { USD: 0.00074, ... }, time: 기준 시각(ms) }. 실패 응답이면 에러
export function parseRates(json) {
  if (json?.result !== 'success' || !json.rates) throw new Error(`환율 API 실패: ${json?.['error-type'] ?? '알 수 없음'}`)
  return { rates: json.rates, time: json.time_last_update_unix * 1000 }
}

// unit 단위 외화가 몇 원인지. rates는 1원 = rates[code] 외화. 없는 통화면 null
export function krwFor(unit, code, rates) {
  const r = rates?.[code]
  return r ? Math.round(unit / r) : null
}

// 한국 시각 "2026-11-11 09:02". 시각이 아니면(예: '미확인') null
export function timeText(time) {
  const ms = typeof time === 'number' ? time : Date.parse(time)
  if (Number.isNaN(ms)) return null
  return new Date(ms).toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).slice(0, 16)
}

// 화면에 보일 환율과 시각 문구. state는 useRates() 값
// API 성공 → 새 값 + 기준 시각 / 실패·저장값 있음 → 저장값 + 마지막 갱신 / 저장값 없음 → JSON 값 + JSON 시각
export function rateView(currency, state) {
  const krw = state && krwFor(currency.unit, currency.code, state.rates)
  if (krw && state.fresh) return { krw, note: `${timeText(state.time)} 기준` }
  if (krw) return { krw, note: `마지막 갱신: ${timeText(state.time)}` }
  const t = timeText(currency.updated)
  return { krw: currency.krw, note: t && `마지막 갱신: ${t}` }
}
