// 디자인 토큰: 지도(map)와 일정표(plan)가 같이 쓰는 공통 색·모양. 값은 여기서만 바꾼다
// (지도 위험도 색은 map/src/config.js, 블록 8색은 plan/src/config.js에 따로 둔다)
// JS 인라인 스타일과 PNG(canvas)는 이 값을 직접 쓰고, CSS 파일은 applyTokens()가 만든 --tk-* 변수를 쓴다

export const COLOR = {
  primary: '#1f3a68', // 대표색 (진한 남색): 주요 버튼, 링크, 선택 상태, 출발지
  primaryHover: '#172d52',
  primarySoft: '#e7edf7', // 대표색 연한 바탕: 선택된 칸, 놓을 곳 표시

  text: '#222', // 본문 글자
  textSub: '#666', // 보조 글자 (설명, 날짜, 시간)
  textMuted: '#888', // 더 흐린 글자 (출처, 미확인)
  onDark: '#fff', // 진한 바탕 위 글자

  surface: '#fff', // 카드·창 바탕
  surfaceSub: '#f4f6f8', // 요약 카드, 표 머리글
  surfaceMuted: '#fafbfc', // 보관함·메모 상자
  border: '#e3e6ea', // 연한 선 (칸 경계, 30분 점선)
  borderStrong: '#cfd4da', // 진한 선 (정시 실선, 표 테두리)

  badgeBg: '#eef0f3', // 연회색 배지 (비행시간, 분위기)
  badgeText: '#3a3f45',

  noticeBg: '#fff4e5', // 주의 안내 박스 (어댑터 필요, 시기 고르기 안내)
  noticeBorder: '#f3cf9b',
  okBg: '#edf7ee', // 괜찮음 안내 박스 (어댑터 필요 없음)
  okBorder: '#b7dfbd',
}

// 떠 있는 흰 카드 모양 (툴바, 범례, 안내 문구, 확대 버튼, 메모지, 일정표 헤더 모두 같게)
export const CARD = {
  radius: 10,
  shadow: '0 2px 10px rgba(16, 24, 40, 0.12)',
  shadowStrong: '0 6px 20px rgba(16, 24, 40, 0.18)', // 메모지·끄는 블록처럼 더 떠 보여야 할 때
  border: '1px solid rgba(16, 24, 40, 0.08)',
}

// 흰 카드 스타일 한 벌 (인라인 style에 펼쳐 쓴다)
export const cardStyle = { background: COLOR.surface, borderRadius: CARD.radius, boxShadow: CARD.shadow, border: CARD.border }

// CSS 파일에서 쓰도록 :root에 --tk-색이름 변수로 넣는다 (main.jsx에서 한 번)
export function applyTokens(root = document.documentElement) {
  for (const [name, value] of Object.entries(COLOR)) root.style.setProperty(`--tk-${name}`, value)
  root.style.setProperty('--tk-radius', `${CARD.radius}px`)
  root.style.setProperty('--tk-shadow', CARD.shadow)
  root.style.setProperty('--tk-card-border', CARD.border)
}
