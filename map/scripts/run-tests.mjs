// 사용: npm test — map/src/utils/*.test.js 를 모두 실행하고, 하나라도 실패하면 실패로 끝난다
import { readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const dir = new URL('../src/utils/', import.meta.url)
let failed = 0
for (const f of readdirSync(dir).filter((f) => f.endsWith('.test.js'))) {
  try {
    execFileSync(process.execPath, [fileURLToPath(new URL(f, dir))], { stdio: 'pipe' })
    console.log(`ok   ${f}`)
  } catch (e) {
    failed++
    console.log(`FAIL ${f}\n${e.stderr}`)
  }
}
process.exit(failed ? 1 : 0)
