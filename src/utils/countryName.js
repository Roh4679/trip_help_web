import countries from 'i18n-iso-countries'
import ko from 'i18n-iso-countries/langs/ko.json'

countries.registerLocale(ko)

// 지도 숫자 ID → 한국어 이름. ID가 없는 곳(코소보 등)은 지도 데이터의 영어 이름
export function countryName(shape) {
  return (shape.id && countries.getName(shape.id, 'ko')) || shape.properties.name
}
