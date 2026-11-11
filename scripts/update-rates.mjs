// 빌드 전에 환율 API를 한 번 불러 countries.json의 환율(krw)과 갱신 시각(updated)을 덮어쓴다.
// Vercel 빌드(VERCEL 환경변수)나 --force일 때만 돈다. 실패해도 빌드는 멈추지 않고 기존 JSON을 쓴다
import { readFile, writeFile } from 'node:fs/promises'
import { RATES_URL } from '../src/config.js'
import { parseRates, krwFor } from '../src/utils/rates.js'

const FILE = new URL('../src/data/countries.json', import.meta.url)

if (!process.env.VERCEL && !process.argv.includes('--force')) {
  console.log('[환율] 로컬 빌드라 건너뜀 (갱신하려면 npm run rates)')
  process.exit(0)
}

try {
  const res = await fetch(RATES_URL, { signal: AbortSignal.timeout(10_000) })
  const { rates, time } = parseRates(await res.json())
  const countries = JSON.parse(await readFile(FILE, 'utf8'))
  const updated = new Date(time).toISOString()
  for (const { currency: c } of countries) {
    const krw = c && krwFor(c.unit, c.code, rates)
    if (krw) Object.assign(c, { krw, updated })
  }
  await writeFile(FILE, JSON.stringify(countries, null, 2) + '\n')
  console.log(`[환율] 갱신 완료 (${updated})`)
} catch (e) {
  console.warn(`[환율] 갱신 실패, 기존 JSON 값을 씀: ${e.message}`)
}
