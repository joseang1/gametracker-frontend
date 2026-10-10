import { getPageItems, GAP_START, GAP_END } from '@/core/pagination/page-items'

const human = (items) => items.map((item) => (typeof item === 'number' ? item + 1 : '…'))

describe('getPageItems', () => {
  it('shows every page when there are few', () => {
    expect(human(getPageItems(0, 3))).toEqual([1, 2, 3])
    expect(human(getPageItems(4, 9))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('shows nothing when there are no pages', () => {
    expect(getPageItems(0, 0)).toEqual([])
  })

  it('centres the current page between the first and the last', () => {
    expect(human(getPageItems(5, 45062))).toEqual([1, '…', 4, 5, 6, 7, 8, '…', 45062])
  })

  it('fills the start instead of showing dots near the first page', () => {
    expect(human(getPageItems(0, 45062))).toEqual([1, 2, 3, 4, 5, 6, 7, '…', 45062])
    expect(human(getPageItems(1, 45062))).toEqual([1, 2, 3, 4, 5, 6, 7, '…', 45062])
  })

  it('fills the end instead of showing dots near the last page', () => {
    expect(human(getPageItems(45061, 45062))).toEqual([1, '…', 45056, 45057, 45058, 45059, 45060, 45061, 45062])
  })

  it('shows a number instead of dots that would hide a single page', () => {
    expect(human(getPageItems(4, 45062))).toEqual([1, 2, 3, 4, 5, 6, 7, '…', 45062])
  })

  it.each([0, 1, 5, 500, 45059, 45061])('always returns 9 items so the buttons do not jump (page %s)', (page) => {
    expect(getPageItems(page, 45062)).toHaveLength(9)
  })

  it('gives each gap its own name so they can be told apart', () => {
    const items = getPageItems(500, 45062)

    expect(items).toContain(GAP_START)
    expect(items).toContain(GAP_END)
  })

  it('returns 0-based page indexes like the backend', () => {
    expect(getPageItems(0, 3)).toEqual([0, 1, 2])
  })
})
