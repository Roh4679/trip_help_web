import { COLOR } from '../../shared/tokens.js'
// 기준값은 여기서만 바꾼다 (PLANNING_map.md 10장)
export const RISK_LEVEL_BLOCK = 4 // 여행경보 이 단계 이상이면 정보를 제공하지 않는다 (토스트만)
export const BLOCK_SPECIAL_WARNING = false // true면 특별여행주의보(risk.special) 나라도 정보를 제공하지 않는다
export const RISK_LEVEL_WARN = 3 // 이 단계 이상(또는 특별여행주의보)은 정보는 보여 주되 빨강 빗금 + 빨간 경고 띠로 경고하고 추천에서 뺀다
export const WARNING_COLORS = { background: '#fdecea', border: '#e0a29b', text: '#b3261e' } // 상세 창 맨 위·메모지의 빨간 경고

export const COLORS = {
  ocean: '#dbe9f4',
  none: '#c8c8c8', // 데이터 없음 (준비 중)
  home: COLOR.primary, // 출발지(한국): 대표색. 초록~빨강은 위험도에만 쓴다
  border: '#fff',
  hoverBorder: '#333',
}

// 여행경보 단계별 나라 색 (초록 → 빨강). 지역마다 다르면 risk.level(주요 관광지 기준)으로 고른다
// 3 = 특별여행주의보·3단계(정보는 보여 주되 경고), 4 = 4단계·방문 제한(북한, 정보 제공 안 함): 둘 다 빗금. 큰 나라가 무겁지 않게 빨강은 톤을 낮춘다
export const RISK_COLORS = {
  0: '#7fc48c', // 없음: 초록
  1: '#c6e28f', // 1단계: 연두
  2: '#f4b86a', // 2단계: 주황
  3: { base: '#dc978e', hatch: '#f3d0cb' }, // 빨강 + 빗금
  4: { base: '#b0645d', hatch: '#d39a94' }, // 진한 빨강 + 빗금
}

export const RAINY_MM = 150 // 월 강수량이 이 값 이상이면 우기

// 기온 → 색 (사이는 선형 보간)
export const TEMP_COLORS = [
  [-10, [33, 102, 172]], // 진한 파랑
  [15, [255, 250, 225]], // 연노랑
  [35, [178, 24, 43]], // 진한 빨강
]

// 한국 플러그 기준 (PLANNING_map.md 4.3)
// fullTypes가 있으면 굵은 접지형까지 그대로 꽂힘, thinTypes만 있으면 얇은 플러그만 꽂힘
export const KOREA_PLUG = { fullTypes: ['E', 'F'], thinTypes: ['C'], minVoltage: 220, maxVoltage: 240 }

export const HOME_ID = '410' // 출발지: 대한민국 (지도 숫자 ID)

export const DANGER_HATCH = { gap: 5, width: 1 } // 빗금 간격·굵기 (화면 px, 확대해도 그대로)

// 외교부 해외안전여행: 나라별 페이지 (risk.safetyId가 없으면 첫 화면)
export const SAFETY_SITE = 'https://www.0404.go.kr/'
export const SAFETY_COUNTRY_URL = 'https://www.0404.go.kr/ntnSafetyInfo/{id}/detail'

// 핀 색: 나라 색과 같은 기준, 같은 색 땅 위에서도 보이게 조금 진하게 (작은 나라는 데이터가 없거나 위험해도 핀으로 표시)
export const PIN_COLORS = { 0: '#3e9a52', 1: '#86b23f', 2: '#e0892a', 3: '#c4574b', 4: '#8e3b35', none: '#9e9e9e', home: COLOR.primary }
export const RESULT_DIM_OPACITY = 0.25 // 추천 결과가 떠 있을 때 결과가 아닌 나라·핀의 투명도 (결과 나라만 진하게)
export const PIN_SHAPE_IDS = ['US-HI'] // 지도에 모양은 있지만 너무 작아 핀도 꽂는 곳 (하와이). 그 밖의 나라는 색으로만 보여 준다
export const PIN_SMALL = { scale: 0.7, untilZoom: 2 } // 이 배율 미만에서는 핀을 작게 (유럽처럼 핀이 몰린 곳이 겹치지 않게)
export const FOCUS_ZOOM = { fill: 0.6, point: 4 } // 검색으로 고르면: 나라 모양은 화면의 60%를 채우게, 작은 나라 핀은 4배
export const MAX_ZOOM = 8

// 지도 회전 (좌우로 끝없이 이어지는 지도): 가로로 끌면 지도를 옮기는 대신 투영의 중심 경도를 돌린다
export const MAP_SIZE = [960, 460] // 지도 그림 크기 (viewBox 좌표)
export const START_LON = 127 // 처음 화면·'원래대로'의 가운데 경도 (한국 근처)
export const ZOOM_STEP = 1.5 // +/− 버튼 한 번에 확대·축소하는 배율

// 모바일
export const MOBILE_QUERY = '(max-width: 639px)' // 상세 창을 화면 전체로 띄우는 폭
export const TOUCH_QUERY = '(pointer: coarse)' // 손가락 터치 화면: 메모지 끄고, 누르는 영역을 넓힌다
export const PORTRAIT_LAT = 25 // 세로 화면에서 처음 가운데 둘 위도 (경도는 START_LON)
export const TOUCH_HIT_RADIUS = 18 // 핀·버블을 누를 수 있는 영역 반지름 (px)

// 환율: 키 없이 쓰는 open.er-api.com (원화 기준, 하루 한 번 갱신). 화면에 출처 표시 필요
export const RATES_URL = 'https://open.er-api.com/v6/latest/KRW'
export const RATES_CACHE_MS = 60 * 60 * 1000 // 브라우저에 저장한 값을 다시 쓰는 시간 (1시간)
