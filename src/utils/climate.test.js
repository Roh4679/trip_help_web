// 실행: node src/utils/climate.test.js
import assert from 'node:assert/strict'
import { tempColor, tempTextColor } from './climate.js'

assert.equal(tempColor(-10), 'rgb(33, 102, 172)') // 진한 파랑
assert.equal(tempColor(35), 'rgb(178, 24, 43)') // 진한 빨강
assert.equal(tempTextColor(-10), '#fff') // 어두운 배경엔 흰 글자
assert.equal(tempTextColor(15), '#222') // 밝은 배경엔 검은 글자
assert.equal(tempTextColor(35), '#fff')
console.log('ok')
