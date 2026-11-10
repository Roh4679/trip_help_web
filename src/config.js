// 기준값은 여기서만 바꾼다 (PLANNING.md 10장)
export const RISK_LEVEL_BLOCK = 3 // 여행경보 이 단계 이상이면 위험 국가(검정)
export const BLOCK_SPECIAL_WARNING = true // 특별여행주의보(risk.special)가 국가 대부분에 걸린 나라도 위험 국가(검정)

export const COLORS = {
  ocean: '#dbe9f4',
  ok: '#9fd3a8',
  danger: '#222',
  none: '#c8c8c8',
  border: '#fff',
  hoverBorder: '#333',
}

export const RAINY_MM = 150 // 월 강수량이 이 값 이상이면 우기

// 기온 → 색 (사이는 선형 보간)
export const TEMP_COLORS = [
  [-10, [33, 102, 172]], // 진한 파랑
  [15, [255, 250, 225]], // 연노랑
  [35, [178, 24, 43]], // 진한 빨강
]

// 한국 플러그 기준 (PLANNING.md 4.3)
// fullTypes가 있으면 굵은 접지형까지 그대로 꽂힘, thinTypes만 있으면 얇은 플러그만 꽂힘
export const KOREA_PLUG = { fullTypes: ['E', 'F'], thinTypes: ['C'], minVoltage: 220, maxVoltage: 240 }

export const PIN_COLOR = '#e4572e'
export const BUBBLE_RADIUS = 8 // bubble.radius가 없을 때 기본 크기 (지도 좌표 px)
export const MAX_ZOOM = 8
export const ZOOM_STEP = 1.5 // +/− 버튼 한 번에 확대·축소하는 배율
