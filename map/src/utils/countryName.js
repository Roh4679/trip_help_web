import countries from 'i18n-iso-countries'
import ko from 'i18n-iso-countries/langs/ko.json' with { type: 'json' }
import en from 'i18n-iso-countries/langs/en.json' with { type: 'json' }

countries.registerLocale(ko)
countries.registerLocale(en)

// 지도 숫자 ID → 한국어 이름. ID가 없는 곳(코소보 등)은 지도 데이터의 영어 이름
export function countryName(shape) {
  return (shape.id && countries.getName(shape.id, 'ko')) || shape.properties.name
}

// 검색용: 한국어·영어로 부르는 이름 전부 (예: 792 → 터키, Türkiye, Turkey). 숫자 ID나 iso2 코드를 받는다
export function allNames(code) {
  if (!code) return []
  const id = /^\d+$/.test(code) ? code : code.toUpperCase()
  return ['ko', 'en'].flatMap((lang) => countries.getName(id, lang, { select: 'all' }) ?? [])
}
