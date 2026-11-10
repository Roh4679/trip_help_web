import { useState } from 'react'
import { Heading } from '@astryxdesign/core/Heading'
import ClimateBar from './ClimateBar.jsx'
import ClothingSection from './ClothingSection.jsx'
import { adapterText, voltageText } from '../utils/plug.js'
import { dateText } from '../utils/format.js'

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

// 나라 상세 내용. 껍데기(Dialog 등)와 분리해 두어 나중에 사이드 패널로 옮기기 쉽게 한다
export default function CountryDetail({ country: c }) {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const { plug, currency, price, entry } = c

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, lineHeight: 1.6 }}>
      <Section title="시기별 기후">
        <ClimateBar climate={c.climate} city={c.climateCity} selectedMonth={month} onSelectMonth={setMonth} />
      </Section>

      <Section title="옷차림 추천">
        <ClothingSection month={c.climate[month - 1]} />
      </Section>

      <Section title="가져가면 좋을 물품">
        <p>
          <b>{adapterText(plug)}</b>
        </p>
        {voltageText(plug) && <p>{voltageText(plug)}</p>}
        <ul style={listStyle}>
          {c.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </Section>

      <Section title="통화 · 환율 · 물가">
        <p>{currency.name} · {currency.code}</p>
        <p>
          {currency.unit.toLocaleString()}{currency.name} = 약 {currency.krw.toLocaleString()}원 ({dateText(currency.updated)})
        </p>
        <p>
          물가: 한국보다 {PRICE_LEVELS[price.level]} · 커피 {price.coffee} · 한 끼 {price.meal}
        </p>
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
