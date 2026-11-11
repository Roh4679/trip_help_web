// 기준값은 여기서만 바꾼다 (PLANNING.md 10장)
export const RISK_LEVEL_BLOCK = 3 // 여행경보 이 단계 이상이면 위험 국가(빗금)
export const BLOCK_SPECIAL_WARNING = true // 특별여행주의보(risk.special)가 국가 대부분에 걸린 나라도 위험 국가(빗금)

export const COLORS = {
  ocean: '#dbe9f4',
  ok: '#9fd3a8',
  danger: '#5a5a5a', // 위험 국가 바탕 (짙은 회색)
  dangerHatch: '#9a9a9a', // 위험 국가 사선 빗금
  none: '#c8c8c8',
  home: '#f0c35a', // 출발지(한국)
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

export const HOME_ID = '410' // 출발지: 대한민국 (지도 숫자 ID)

export const DANGER_HATCH = { gap: 5, width: 1 } // 빗금 간격·굵기 (화면 px, 확대해도 그대로)

// 핀 색: 상태별 (작은 나라는 데이터가 없거나 위험해도 핀으로 표시하므로 색으로 구분한다)
export const PIN_COLORS = { ok: '#e4572e', none: '#9e9e9e', danger: '#555555', home: '#f0c35a' }
export const PIN_SMALL = { scale: 0.7, untilZoom: 2 } // 이 배율 미만에서는 핀을 작게 (유럽처럼 핀이 몰린 곳이 겹치지 않게)
export const FOCUS_ZOOM = { fill: 0.6, point: 4 } // 검색으로 고르면: 나라 모양은 화면의 60%를 채우게, 작은 나라 핀은 4배
export const MAX_ZOOM = 8
export const ZOOM_STEP = 1.5 // +/− 버튼 한 번에 확대·축소하는 배율

// 모바일
export const MOBILE_QUERY = '(max-width: 639px)' // 상세 창을 화면 전체로 띄우는 폭
export const TOUCH_QUERY = '(pointer: coarse)' // 손가락 터치 화면: 메모지 끄고, 누르는 영역을 넓힌다
export const PORTRAIT_CENTER = [110, 25] // 세로 화면에서 처음 보여줄 곳 [경도, 위도] (아시아)
export const TOUCH_HIT_RADIUS = 18 // 핀·버블을 누를 수 있는 영역 반지름 (px)

// 환율: 키 없이 쓰는 open.er-api.com (원화 기준, 하루 한 번 갱신). 화면에 출처 표시 필요
export const RATES_URL = 'https://open.er-api.com/v6/latest/KRW'
export const RATES_CACHE_MS = 60 * 60 * 1000 // 브라우저에 저장한 값을 다시 쓰는 시간 (1시간)
