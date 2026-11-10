import { KOREA_PLUG } from '../config.js'

// 콘센트 타입 → 말로 된 모양 설명 (화면에는 타입 알파벳 대신 이걸 보여준다)
const SOCKET_SHAPES = {
  A: '납작한 11자 모양 콘센트',
  B: '납작한 11자 모양 콘센트',
  G: '영국식 3구 콘센트',
  I: '비스듬한 八자 모양 콘센트',
  D: '굵은 둥근 핀 3개 모양 콘센트',
  M: '굵은 둥근 핀 3개 모양 콘센트',
  J: '둥근 핀 3개 모양 콘센트',
  L: '둥근 핀 3개가 일자로 있는 콘센트',
  N: '둥근 핀 3개 모양 콘센트',
  H: '납작한 핀 3개 모양 콘센트',
  K: '둥근 핀 2개와 아래 납작한 핀 모양 콘센트',
  O: '둥근 핀 3개 모양 콘센트',
}

const compatible = (types) => types.some((t) => KOREA_PLUG.types.includes(t))
const voltageOk = (v) => v >= KOREA_PLUG.minVoltage && v <= KOREA_PLUG.maxVoltage

// 판단 규칙: C, E, F 중 하나라도 있고 전압이 220~240V면 어댑터 필요 없음 (PLANNING.md 4.3)
export function needsAdapter({ types, voltage }) {
  return !(compatible(types) && voltageOk(voltage))
}

export function adapterText(plug) {
  if (!needsAdapter(plug)) return '어댑터 필요 없음'
  if (compatible(plug.types)) return '변환 어댑터 필요'
  const shapes = [...new Set(plug.types.map((t) => SOCKET_SHAPES[t] ?? '한국과 다른 모양 콘센트'))]
  return `변환 어댑터 필요 · ${shapes.join(' 또는 ')}예요`
}

export function voltageText({ voltage }) {
  if (voltageOk(voltage)) return null
  return `전압이 ${voltage}V라 한국 전용 기기(드라이기, 고데기 등)는 쓰기 어려워요. 프리볼트 제품인지 확인하세요`
}
