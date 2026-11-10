import { useSyncExternalStore } from 'react'

// CSS 미디어 쿼리가 맞는지 (화면 크기·터치 여부가 바뀌면 다시 그린다)
export function useMedia(query) {
  return useSyncExternalStore(
    (onChange) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', onChange)
      return () => m.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}
