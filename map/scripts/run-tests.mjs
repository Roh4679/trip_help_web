// 사용: node map/scripts/run-tests.mjs [폴더 ...] — 폴더 안의 *.test.js 를 모두 실행하고, 하나라도 실패하면 실패로 끝난다
// 폴더를 안 주면 map/src/utils. npm test는 map과 plan 폴더를 같이 넘긴다 (package.json)
import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const dirs = process.argv.length > 2 ? process.argv.slice(2).map((d) => resolve(d)) : [fileURLToPath(new URL('../src/utils/', import.meta.url))]
let failed = 0
for (const dir of dirs) {
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.test.js'))) {
    try {
      execFileSync(process.execPath, [join(dir, f)], { stdio: 'pipe' })
      console.log(`ok   ${f}`)
    } catch (e) {
      failed++
      console.log(`FAIL ${f}\n${e.stderr}`)
    }
  }
}
process.exit(failed ? 1 : 0)
