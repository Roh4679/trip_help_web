import { clothing } from '../utils/clothing.js'
import { isRainy } from '../utils/climate.js'

export default function ClothingSection({ month }) {
  const items = clothing(month.temp, isRainy(month))
  return (
    <p>
      <b>{month.month}월</b> (평균 {month.temp}℃): {items.join(', ')}
    </p>
  )
}
