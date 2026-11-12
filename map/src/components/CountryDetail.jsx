import { useState } from 'react'
import { Heading } from '@astryxdesign/core/Heading'
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList'
import ClimateBar from './ClimateBar.jsx'
import ClothingSection from './ClothingSection.jsx'
import { adapterText, voltageText } from '../utils/plug.js'
import DateNote from './DateNote.jsx'
import RiskLink from './RiskLink.jsx'
import RiskWarning from './RiskWarning.jsx'
import { flightText, timeDiffText, mainAreaText } from '../utils/format.js'
import { rateView } from '../utils/rates.js'
import { useRates } from '../utils/useRates.js'
import { COLOR } from '../../../shared/tokens.js'
import { Icon } from '@astryxdesign/core/Icon'
import { Plug, Zap } from 'lucide-react'

const PRICE_LEVELS = ['', '아주 쌈', '조금 쌈', '비슷함', '조금 비쌈', '아주 비쌈']
const listStyle = { listStyle: 'disc', paddingLeft: 20, margin: 0 }

function Section({ title, children }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Heading level={3}>{title}</Heading>
      {children}
    </section>
  )
}

// 플러그·전압 안내 박스. 그대로 쓸 수 있으면 초록, 어댑터나 전압 확인이 필요하면 주황
function PlugBox({ plug }) {
  const adapter = adapterText(plug)
  const voltage = voltageText(plug)
  const ok = adapter === '어댑터 필요 없음' && !voltage
  const line = { display: 'flex', gap: 8, alignItems: 'center' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px', borderRadius: 8, background: ok ? COLOR.okBg : COLOR.noticeBg, border: `1px solid ${ok ? COLOR.okBorder : COLOR.noticeBorder}` }}>
      <div style={line}><Icon icon={Plug} size="sm" color="secondary" /><span>{adapter}</span></div>
      {voltage && <div style={line}><Icon icon={Zap} size="sm" color="secondary" /><span>{voltage}</span></div>}
    </div>
  )
}

function SummaryItem({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: COLOR.textSub }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{children}</div>
    </div>
  )
}

// 스크롤하지 않아도 보이게 맨 위에 핵심 정보만 모은다
function Summary({ country: c }) {
  const { entry } = c
  const visa = entry.visaFreeDays ? `무비자 ${entry.visaFreeDays}일` : '비자 필요'
  const eta = entry.eta && `${entry.eta.split(' (')[0]} 필요` // 예: "ESTA (출발 …)" → "ESTA 필요"
  // 4칸 한 줄, 좁으면 2×2 (index.css의 .summary-grid 컨테이너 쿼리)
  return (
    <div className="summary" style={{ padding: 14, background: COLOR.surfaceSub, borderRadius: 8 }}>
      <div className="summary-grid">
      <SummaryItem label="여행경보">
        <RiskLink risk={c.risk} short />
      </SummaryItem>
      <SummaryItem label="비행시간">{flightText(c.flight)}</SummaryItem>
      <SummaryItem label="시차">{timeDiffText(c.timeDiff, c.dstTimeDiff)}</SummaryItem>
      <SummaryItem label="입국">{eta ? `${visa} · ${eta}` : visa}</SummaryItem>
      </div>
    </div>
  )
}

// 나라 상세 내용. 껍데기(Dialog 등)와 분리해 두어 나중에 사이드 패널로 옮기기 쉽게 한다
export default function CountryDetail({ country: c }) {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const { plug, currency, price, entry } = c
  const rate = rateView(currency, useRates())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, lineHeight: 1.6 }}>
      <RiskWarning country={c} />
      <Summary country={c} />

      <Section title="여행경보">
        <p>
          <RiskLink risk={c.risk} />
          <DateNote updated={c.risk.updated} />
        </p>
        {c.risk.mixed && <p style={{ color: COLOR.textSub, fontSize: 13 }}>{mainAreaText(c)}</p>}
        {c.risk.note && <p style={{ fontSize: 14 }}>{c.risk.note}</p>}
      </Section>

      <Section title="시기별 기후">
        <ClimateBar climate={c.climate} city={c.climateCity} selectedMonth={month} onSelectMonth={setMonth} />
      </Section>

      <Section title="옷차림 추천">
        <ClothingSection month={c.climate[month - 1]} />
      </Section>

      <Section title="가져가면 좋을 물품">
        <PlugBox plug={plug} />
        <ul style={listStyle}>
          {c.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </Section>

      <Section title="통화 · 환율 · 물가">
        <MetadataList>
          <MetadataListItem label="통화">{currency.name} · {currency.code}</MetadataListItem>
          <MetadataListItem label="환율">
            {currency.unit.toLocaleString()}{currency.name} = 약 {rate.krw.toLocaleString()}원
            {rate.note && <span style={{ color: COLOR.textSub, fontSize: 13 }}> ({rate.note})</span>}
          </MetadataListItem>
          <MetadataListItem label="물가">한국보다 {PRICE_LEVELS[price.level]}</MetadataListItem>
          <MetadataListItem label="커피 한 잔">{price.coffee}</MetadataListItem>
          <MetadataListItem label="한 끼 식사">{price.meal}</MetadataListItem>
        </MetadataList>
      </Section>

      <Section title="필요한 서류 및 심사">
        <ul style={listStyle}>
          <li>{entry.visaFreeDays ? `무비자 ${entry.visaFreeDays}일` : '비자 필요'}</li>
          <li>전자여행허가: {entry.eta ?? '필요 없음'}</li>
          <li>여권: {entry.passport}</li>
          {entry.notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </Section>

      <Section title="한국과 다른 문화">
        <ul style={listStyle}>
          {c.culture.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </Section>

      <Section title="기본 인사말">
        <ul style={listStyle}>
          {c.greetings.map((g) => (
            <li key={g.ko}>
              {g.ko}: <b>{g.local}</b> ({g.pron})
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
