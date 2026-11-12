// 일정표를 PNG로 저장 (PLANNER_plan.md 3.9). 화면 캡처가 아니라 데이터로 직접 그려서
// 화면에 다 안 보이는 긴 표·많은 날도 한 장에 전부 들어간다. 메모도 오른쪽에 같이 그린다
import { BLOCK_COLORS, DAY_START_MIN, SLOT_MIN } from './config.js'
import { slots, dayLabel, timeLabel } from './time.js'

const SCALE = 2 // 선명하게 2배로 그린다
const PAD = 20
const TITLE_H = 36
const HEAD_H = 44
const ROW = 22 // 30분 칸 높이
const TIME_W = 52
const DAY_W = 160
const MEMO_W = 260
const GAP = 20

// 그림 크기와 칸 위치 (그리기와 분리해 둔 계산)
export function pngLayout({ days, endHour }) {
  const rows = slots(endHour).length
  const tableW = TIME_W + days * DAY_W
  const tableH = HEAD_H + rows * ROW
  return { rows, tableW, tableH, width: PAD * 2 + tableW + GAP + MEMO_W, height: PAD * 2 + TITLE_H + tableH }
}

// 글을 주어진 너비에 맞게 줄로 나눈다 (줄바꿈 문자는 그대로 지킨다)
function wrap(ctx, text, width) {
  const lines = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const ch of para) {
      if (ctx.measureText(line + ch).width > width && line) {
        lines.push(line)
        line = ch
      } else line += ch
    }
    lines.push(line)
  }
  return lines
}

// 한 줄에 안 들어가면 끝을 …로 줄인다
function fit(ctx, text, width) {
  if (ctx.measureText(text).width <= width) return text
  let t = text
  while (t && ctx.measureText(t + '…').width > width) t = t.slice(0, -1)
  return t + '…'
}

export function drawPlan(plan, font) {
  const { startDate, days, endHour, memo, blocks } = plan
  const L = pngLayout(plan)
  const memoLines = (() => {
    const c = document.createElement('canvas').getContext('2d')
    c.font = `13px ${font}`
    return memo.trim() ? wrap(c, memo, MEMO_W - 24) : []
  })()
  const height = Math.max(L.height, PAD * 2 + TITLE_H + 40 + memoLines.length * 20)

  const canvas = document.createElement('canvas')
  canvas.width = L.width * SCALE
  canvas.height = height * SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(SCALE, SCALE)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, L.width, height)
  ctx.textBaseline = 'middle'

  // 제목
  const first = dayLabel(startDate, 0).date
  const last = dayLabel(startDate, days - 1).date
  ctx.fillStyle = '#222'
  ctx.font = `bold 18px ${font}`
  ctx.fillText(`여행 일정표 · ${first} ~ ${last}`, PAD, PAD + TITLE_H / 2 - 4)

  const x0 = PAD
  const y0 = PAD + TITLE_H
  const yOf = (min) => y0 + HEAD_H + ((min - DAY_START_MIN) / SLOT_MIN) * ROW

  // 머리글
  ctx.fillStyle = '#f4f6f8'
  ctx.fillRect(x0, y0, L.tableW, HEAD_H)
  ctx.textAlign = 'center'
  for (let i = 0; i < days; i++) {
    const { title, date } = dayLabel(startDate, i)
    const cx = x0 + TIME_W + i * DAY_W + DAY_W / 2
    ctx.fillStyle = '#222'
    ctx.font = `bold 13px ${font}`
    ctx.fillText(title, cx, y0 + 15)
    ctx.fillStyle = '#666'
    ctx.font = `11px ${font}`
    ctx.fillText(date, cx, y0 + 31)
  }

  // 시간 줄: 정시 실선, 30분 점선
  ctx.textAlign = 'right'
  for (const min of [...slots(endHour), endHour * 60]) {
    const y = Math.round(yOf(min)) + 0.5
    const hour = min % 60 === 0
    ctx.strokeStyle = hour ? '#cfd4da' : '#e3e6ea'
    ctx.setLineDash(hour ? [] : [3, 3])
    ctx.beginPath()
    ctx.moveTo(x0 + TIME_W, y)
    ctx.lineTo(x0 + L.tableW, y)
    ctx.stroke()
    if (hour) {
      ctx.fillStyle = '#666'
      ctx.font = `11px ${font}`
      ctx.fillText(timeLabel(min), x0 + TIME_W - 6, y)
    }
  }
  ctx.setLineDash([])
  ctx.strokeStyle = '#e3e6ea'
  for (let i = 0; i <= days; i++) {
    const x = Math.round(x0 + TIME_W + i * DAY_W) + 0.5
    ctx.beginPath()
    ctx.moveTo(x, y0)
    ctx.lineTo(x, y0 + L.tableH)
    ctx.stroke()
  }
  ctx.strokeStyle = '#cfd4da'
  ctx.strokeRect(x0 + 0.5, y0 + 0.5, L.tableW, L.tableH)

  // 블록
  ctx.textAlign = 'left'
  for (const b of blocks.filter((b) => b.day != null && b.day <= days)) {
    const c = BLOCK_COLORS[b.color] ?? BLOCK_COLORS[0]
    const x = x0 + TIME_W + (b.day - 1) * DAY_W + 3
    const y = yOf(b.start) + 1
    const w = DAY_W - 6
    const h = (b.duration / SLOT_MIN) * ROW - 2
    ctx.fillStyle = c.bg
    ctx.strokeStyle = c.border
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 6)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = c.border
    ctx.fillRect(x, y + 2, 4, h - 4)
    const time = `${timeLabel(b.start)}~${timeLabel(b.start + b.duration)}`
    ctx.fillStyle = '#222'
    ctx.font = `bold 13px ${font}`
    if (h < 40) {
      ctx.fillText(fit(ctx, `${b.title}  ${time}`, w - 14), x + 9, y + h / 2)
    } else {
      ctx.fillText(fit(ctx, b.title, w - 14), x + 9, y + 12)
      ctx.font = `11px ${font}`
      ctx.fillStyle = '#444'
      ctx.fillText(time, x + 9, y + 28)
    }
  }

  // 메모
  const mx = x0 + L.tableW + GAP
  ctx.fillStyle = '#fafbfc'
  ctx.strokeStyle = '#e3e6ea'
  ctx.beginPath()
  ctx.roundRect(mx, y0, MEMO_W, height - y0 - PAD, 8)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#222'
  ctx.font = `bold 14px ${font}`
  ctx.fillText('메모', mx + 12, y0 + 18)
  ctx.font = `13px ${font}`
  ctx.fillStyle = memoLines.length ? '#333' : '#999'
  ;(memoLines.length ? memoLines : ['(메모 없음)']).forEach((line, i) => ctx.fillText(line, mx + 12, y0 + 44 + i * 20))

  return canvas
}

// 그린 그림을 파일로 내려받는다: 일정표-표 2-2026-04-08.png
export function downloadPlanPng(plan, name = '') {
  const font = getComputedStyle(document.body).fontFamily || 'sans-serif'
  drawPlan(plan, font).toBlob((blob) => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `일정표-${name ? `${name}-` : ''}${plan.startDate}.png`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000) // 바로 지우면 일부 브라우저에서 내려받기가 실패한다
  }, 'image/png')
}
