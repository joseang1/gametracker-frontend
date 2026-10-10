export const GAP_START = 'gap-start'
export const GAP_END = 'gap-end'

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => from + index)

const toIndex = (item) => (typeof item === 'number' ? item - 1 : item)

export function getPageItems(page, totalPages, siblings = 2) {
  const current = page + 1
  const last = totalPages

  if (last <= siblings * 2 + 5) return range(1, last).map(toIndex)

  const start = Math.max(Math.min(current - siblings, last - siblings * 2 - 2), 3)
  const end = Math.min(Math.max(current + siblings, siblings * 2 + 3), last - 2)

  return [1, start > 3 ? GAP_START : 2, ...range(start, end), end < last - 2 ? GAP_END : last - 1, last].map(toIndex)
}
