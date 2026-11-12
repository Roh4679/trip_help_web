import { useMemo, useState } from 'react'
import { Typeahead, TypeaheadItem, createStaticSource } from '@astryxdesign/core/Typeahead'
import { shapes, smallPlaces } from '../utils/places.js'
import { buildSearchItems, STATUS_LABEL } from '../utils/search.js'

// 나라 검색 (PLANNING_map.md 9장 10단계). 고르면 onPick(장소) → 지도가 그 나라로 이동하고 클릭했을 때와 같은 동작을 한다
export default function CountrySearch({ onPick, width = 240 }) {
  const [value, setValue] = useState(null)
  const source = useMemo(
    () => createStaticSource(buildSearchItems([...shapes, ...smallPlaces]), { keywords: (item) => item.auxiliaryData.keywords }),
    [],
  )

  return (
    <Typeahead
      label="나라 검색"
      isLabelHidden
      placeholder="나라·도시 검색 (예: 태국, 두바이)"
      width={width}
      searchSource={source}
      debounceMs={0}
      value={value}
      onChange={(item) => {
        setValue(null) // 고른 뒤에는 검색창을 비운다
        if (item) onPick(item.auxiliaryData.place)
      }}
      emptySearchText="찾는 나라·도시가 없어요"
      renderItem={(item) => {
        const { place, country } = item.auxiliaryData
        return (
          <TypeaheadItem
            item={item}
            description={country ? `→ ${country} · ${STATUS_LABEL[place.status]}` : STATUS_LABEL[place.status]}
            icon={place.data?.iso2 && <img src={`https://flagcdn.com/w40/${place.data.iso2}.png`} alt="" width={20} />}
          />
        )
      }}
    />
  )
}
