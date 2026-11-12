// 실행: node plan/src/exportPng.test.js — PNG 크기 계산 (그리기는 브라우저에서만)
import assert from 'node:assert/strict'
import { pngLayout } from './exportPng.js'

const base = pngLayout({ days: 3, endHour: 25 }) // 6:00~1:00 = 38칸
assert.equal(base.rows, 38)
assert.equal(base.tableW, 52 + 3 * 160)

// 날이 늘면 가로로, 끝 시간이 늘면 세로로 커진다 (화면에 다 안 보여도 한 장에 전부)
const wide = pngLayout({ days: 10, endHour: 30 })
assert.equal(wide.width - base.width, 7 * 160)
assert.equal(wide.height - base.height, 10 * 22) // 5시간 = 10칸
console.log('ok')
