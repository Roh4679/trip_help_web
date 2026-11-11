// 사용: npm run check-risk
// 0404 해외안전여행 나라별 페이지를 읽어, 지금 데이터(countries.json)와 여행경보 범위가 다른 나라만 표로 보여 준다. 데이터는 고치지 않는다
import { readFile } from 'node:fs/promises'
import { SAFETY_COUNTRY_URL } from '../src/config.js'
import { parseSafetyPage, pageRange, dataRange, rangeText, sameRange } from '../src/utils/riskCheck.js'

const countries = JSON.parse(await readFile(new URL('../src/data/countries.json', import.meta.url), 'utf8'))
const seen = new Set()
const rows = []
const skipped = []

for (const c of countries) {
  const id = c.risk?.safetyId
  if (!id) continue // 나라별 페이지가 없는 곳 (북한)
  // 하와이·괌·사이판처럼 다른 나라 페이지를 같이 쓰는 곳은 그 나라(미국)만 비교한다
  if (seen.has(id)) { skipped.push(c.name); continue }
  seen.add(id)
  const url = SAFETY_COUNTRY_URL.replace('{id}', id)
  if (process.stdout.isTTY) process.stdout.write(`\r읽는 중 ${seen.size} ${c.name}          `) // 터미널에서만 진행 표시
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15_000) })
    if (!res.url.includes('/detail')) throw new Error('나라 페이지가 아님 (첫 화면으로 넘어감)')
    const items = parseSafetyPage(await res.text())
    const page = pageRange(items)
    const data = dataRange(c.risk)
    if (!sameRange(page, data)) {
      const areas = items.map((i) => `${rangeText([i.level, i.level])}: ${i.area}`).join(' / ') || '경보 없음'
      rows.push(`| ${c.name} | ${rangeText(data)} | ${rangeText(page)} | ${areas} |`)
    }
  } catch (e) {
    rows.push(`| ${c.name} | ${rangeText(dataRange(c.risk))} | 읽기 실패 | ${e.message} |`)
  }
}

if (process.stdout.isTTY) process.stdout.write('\r' + ' '.repeat(40) + '\r')
console.log(`0404와 비교한 곳: ${seen.size}곳${skipped.length ? ` (같은 페이지라 건너뜀: ${skipped.join(', ')})` : ''}`)
if (!rows.length) {
  console.log('다른 곳 없음')
} else {
  console.log(`다른 곳 ${rows.length}곳 (데이터는 고치지 않았어요)\n`)
  console.log('| 나라 | 지금 데이터 | 0404 | 0404 지역별 |\n|---|---|---|---|')
  console.log(rows.join('\n'))
}
