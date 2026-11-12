import { useSyncExternalStore } from 'react'
import { RATES_URL, RATES_CACHE_MS } from '../config.js'
import { parseRates } from './rates.js'

// 페이지를 열 때 한 번 가져온다. 브라우저에 저장된 값이 1시간 안 됐으면 API를 부르지 않는다.
// 상태: { rates, time, fresh } — fresh=false면 API 실패로 저장된 옛 값을 쓰는 중. null이면 JSON 값을 쓴다
const KEY = 'rates'
let state = null
const listeners = new Set()

function set(next) {
  state = next
  listeners.forEach((l) => l())
}

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

async function load() {
  const saved = readSaved()
  if (saved && Date.now() - saved.fetchedAt < RATES_CACHE_MS) return set({ ...saved, fresh: true })
  try {
    const { rates, time } = parseRates(await (await fetch(RATES_URL)).json())
    const next = { rates, time, fetchedAt: Date.now() }
    localStorage.setItem(KEY, JSON.stringify(next))
    set({ ...next, fresh: true })
  } catch {
    if (saved) set({ ...saved, fresh: false })
  }
}

if (typeof window !== 'undefined') load()

export function useRates() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
  )
}
