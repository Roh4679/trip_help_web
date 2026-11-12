import { Button } from '@astryxdesign/core/Button'
import { ROW_PX, MAX_END_HOUR } from './config.js'
import { slots, dayLabel, timeLabel } from './time.js'

const TIME_COL = 52 // 시간 글자 칸 너비 (px)
const DAY_COL = 140 // 하루 칸 최소 너비 (px). 날이 많으면 표 안에서 가로로 넘긴다

// 일정표: 가로는 날짜, 세로는 30분 칸. 정시는 실선, 30분은 점선
export default function Timetable({ startDate, days, endHour, onAddHour }) {
  const rows = slots(endHour)
  const line = (min) => (min % 60 === 0 ? '1px solid #cfd4da' : '1px dashed #e3e6ea')
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
              <span style={{ fontSize: 12, color: '#666' }}>{date}</span>
            </div>
          )
        })}

        {/* 시간 칸 */}
        {rows.map((min) => (
          <div key={min} style={{ display: 'contents' }}>
            <div style={{ height: ROW_PX, borderTop: line(min), fontSize: 11, color: '#666', paddingRight: 6, textAlign: 'right', lineHeight: '12px' }}>
              {min % 60 === 0 && timeLabel(min)}
            </div>
            {Array.from({ length: days }, (_, i) => (
              <div key={i} style={{ height: ROW_PX, borderTop: line(min), borderLeft: '1px solid #e3e6ea' }} />
            ))}
          </div>
        ))}
        {/* 마지막 줄 아래 끝선 + 끝 시간 */}
        <div style={{ borderTop: '1px solid #cfd4da', fontSize: 11, color: '#666', paddingRight: 6, textAlign: 'right' }}>{timeLabel(endHour * 60)}</div>
        <div style={{ gridColumn: `span ${days}`, borderTop: '1px solid #cfd4da' }} />
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
