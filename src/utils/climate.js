import { RAINY_MM, TEMP_COLORS } from '../config.js'

export function isRainy({ rain, rainy }) {
  return rainy || rain >= RAINY_MM
}

export function tempColor(temp) {
  const stops = TEMP_COLORS
  if (temp <= stops[0][0]) return rgb(stops[0][1])
  for (let i = 1; i < stops.length; i++) {
    const [t1, c1] = stops[i]
    if (temp <= t1) {
      const [t0, c0] = stops[i - 1]
      const k = (temp - t0) / (t1 - t0)
      return rgb(c0.map((v, j) => v + (c1[j] - v) * k))
    }
  }
  return rgb(stops.at(-1)[1])
}

function rgb(c) {
  return `rgb(${c.map(Math.round).join(', ')})`
}
