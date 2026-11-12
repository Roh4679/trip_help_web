import { Button } from '@astryxdesign/core/Button'
import { DAY_START_MIN, MAX_END_HOUR, ROW_PX, SLOT_MIN } from './config.js'
import { slots, dayLabel, timeLabel } from './time.js'
import BlockCard from './BlockCard.jsx'
import { COLOR } from '../../shared/tokens.js'

const TIME_COL = 52 // 시간 글자 칸 너비 (px)
const DAY_COL = 140 // 하루 칸 최소 너비 (px). 날이 많으면 표 안에서 가로로 넘긴다

const line = (min) => (min % 60 === 0 ? `1px solid ${COLOR.borderStrong}` : `1px dashed ${COLOR.border}`) // 정시 실선, 30분 점선
const topOf = (min) => ((min - DAY_START_MIN) / SLOT_MIN) * ROW_PX

// 끄는 중 미리보기 모양: 'moving' 놓을 자리(점선 테두리) · 'pushed' 밀릴 블록(흐리게) · 'lifted' 들어 올린 원래 자리(더 흐리게)
const LOOK = {
  moving: { borderStyle: 'dashed', boxShadow: `0 0 0 2px ${COLOR.primary}` },
  pushed: { opacity: 0.5 },
  lifted: { opacity: 0.3 },
}

// 일정표: 가로는 날짜, 세로는 30분 칸. 하루 칸(data-plan-day)마다 블록을 시각에 맞춰 겹쳐 그린다
// look(block): 위 LOOK 중 하나의 이름 또는 null
// onResizeStart(e, block): 블록 아래쪽 손잡이를 눌렀을 때 (길이 바꾸기)
export default function Timetable({ startDate, days, endHour, blocks, look = () => null, onDragStart, onResizeStart, onEdit, onAddHour }) {
  const rows = slots(endHour)
  const height = rows.length * ROW_PX
  return (
    <div className="plan-table-wrap">
      <div style={{ display: 'grid', gridTemplateColumns: `${TIME_COL}px repeat(${days}, minmax(${DAY_COL}px, 1fr))`, minWidth: TIME_COL + days * DAY_COL }}>
        {/* 머리글: 1일차 / 4월 8일 (수) */}
        <div className="plan-head" />
        {Array.from({ length: days }, (_, i) => {
          const { title, date } = dayLabel(startDate, i)
          return (
            <div key={i} className="plan-head">
              <b>{title}</b>
              <span style={{ fontSize: 12, color: COLOR.textSub }}>{date}</span>
            </div>
          )
        })}

        {/* 시간 글자 */}
        <div style={{ height }}>
          {rows.map((min) => (
            <div key={min} style={{ height: ROW_PX, borderTop: line(min), fontSize: 11, color: COLOR.textSub, paddingRight: 6, textAlign: 'right', lineHeight: '12px' }}>
              {min % 60 === 0 && timeLabel(min)}
            </div>
          ))}
        </div>

        {/* 하루 칸: 줄 + 블록 */}
        {Array.from({ length: days }, (_, i) => (
          <div key={i} data-plan-day={i + 1} style={{ position: 'relative', height, borderLeft: `1px solid ${COLOR.border}` }}>
            {rows.map((min) => (
              <div key={min} style={{ height: ROW_PX, borderTop: line(min) }} />
            ))}
            {blocks
              .filter((b) => b.day === i + 1)
              .map((b) => {
                const h = (b.duration / SLOT_MIN) * ROW_PX
                return (
                  <div key={b.id} style={{ position: 'absolute', top: topOf(b.start) + 1, left: 3, width: 'calc(100% - 6px)', height: h - 2, transition: 'top 0.12s' }}>
                    <BlockCard
                      block={b}
                      compact={h < 40}
                      // 잡은 위치(블록 윗변에서 커서까지)를 기억해 두어, 끌 때 블록이 커서 위로 튀지 않게
                      onPointerDown={(e) => onDragStart(e, b, e.clientY - e.currentTarget.getBoundingClientRect().top)}
                      onEdit={() => onEdit(b)}
                      style={{ height: '100%', ...LOOK[look(b)] }}
                    />
                    {/* 아래쪽 끝 손잡이: 끌면 30분 단위로 길이가 바뀐다 (블록은 버튼이라 안에 넣지 않고 겹쳐 둔다) */}
                    <div className="plan-resize" title="끌어서 길이 바꾸기" onPointerDown={(e) => onResizeStart(e, b)} />
                  </div>
                )
              })}
          </div>
        ))}

        {/* 마지막 줄 아래 끝선 + 끝 시간 */}
        <div style={{ borderTop: `1px solid ${COLOR.borderStrong}`, fontSize: 11, color: COLOR.textSub, paddingRight: 6, textAlign: 'right' }}>{timeLabel(endHour * 60)}</div>
        <div style={{ gridColumn: `span ${days}`, borderTop: `1px solid ${COLOR.borderStrong}` }} />
      </div>

      {/* [ + ] 끝 시간을 1시간 늘린다 (최대 다음 날 오전 6:00) */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
        <Button
          label={endHour < MAX_END_HOUR ? `+ 1시간 (끝 ${timeLabel((endHour + 1) * 60)})` : '더 늘릴 수 없어요 (최대 오전 6:00)'}
          size="sm"
          variant="secondary"
          isDisabled={endHour >= MAX_END_HOUR}
          onClick={onAddHour}
        />
      </div>
    </div>
  )
}
