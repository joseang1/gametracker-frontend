import { safeRedirect } from '@/router/safe-redirect'

describe('safeRedirect', () => {
  it.each(['/library', '/games/42?tab=reviews', '/'])('keeps the internal path %s', (path) => {
    expect(safeRedirect(path)).toBe(path)
  })

  it.each(['https://evil.site', '//evil.site', '/\\evil.site', 'javascript:alert(1)', undefined, ['/a']])(
    'replaces %s with home',
    (target) => {
      expect(safeRedirect(target)).toBe('/')
    },
  )
})
