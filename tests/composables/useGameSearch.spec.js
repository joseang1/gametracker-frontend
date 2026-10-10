import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { useGameSearch } from '@/composables/useGameSearch'

describe('useGameSearch', () => {
  let gameService

  const withSetup = (options) => {
    let search
    mount({
      setup() {
        search = useGameSearch(gameService, options)
        return () => null
      },
    })
    return search
  }

  const page = (titles, totalPages = 3) => ({ games: titles.map((title) => ({ title })), totalPages })

  beforeEach(() => {
    vi.useFakeTimers()
    gameService = { search: vi.fn().mockResolvedValue(page(['Hades'])) }
  })

  afterEach(() => vi.useRealTimers())

  it('loads the games of the current term and page', async () => {
    const search = withSetup({ initialTerm: 'hades', initialPage: 1 })

    await search.load()

    expect(gameService.search).toHaveBeenCalledWith('hades', 1)
    expect(search.games.value).toEqual([{ title: 'Hades' }])
    expect(search.totalPages.value).toBe(3)
    expect(search.isLoading.value).toBe(false)
  })

  it('waits until the user stops typing before searching', async () => {
    const search = withSetup({ delay: 400 })

    for (const text of ['w', 'wi', 'wit', 'witcher']) {
      search.term.value = text
      await nextTick()
      vi.advanceTimersByTime(100)
    }
    expect(gameService.search).not.toHaveBeenCalled()

    vi.advanceTimersByTime(400)
    await flushPromises()

    expect(gameService.search).toHaveBeenCalledOnce()
    expect(gameService.search).toHaveBeenCalledWith('witcher', 0)
  })

  it('goes back to the first page on a new search', async () => {
    const search = withSetup({ initialPage: 2 })

    search.term.value = 'zelda'
    await nextTick()
    vi.runAllTimers()
    await flushPromises()

    expect(gameService.search).toHaveBeenCalledWith('zelda', 0)
  })

  it('ignores an old answer that arrives after a newer one', async () => {
    let answerOld
    gameService.search
      .mockImplementationOnce(() => new Promise((resolve) => (answerOld = resolve)))
      .mockResolvedValueOnce(page(['The Witcher 3']))
    const search = withSetup()

    search.term.value = 'wit'
    const oldRequest = search.load()
    search.term.value = 'witcher'
    await search.load()
    answerOld(page(['Wit Game']))
    await oldRequest

    expect(search.games.value).toEqual([{ title: 'The Witcher 3' }])
  })

  it('shows the error message when the backend fails', async () => {
    gameService.search.mockRejectedValue(new Error('Cannot reach the server. Is the backend running?'))
    const search = withSetup()

    await search.load()

    expect(search.error.value).toBe('Cannot reach the server. Is the backend running?')
    expect(search.isEmpty.value).toBe(false)
  })

  it('is empty when the search finds nothing', async () => {
    gameService.search.mockResolvedValue(page([], 1))
    const search = withSetup()

    await search.load()

    expect(search.isEmpty.value).toBe(true)
  })

  describe('goToPage', () => {
    it('loads another page', async () => {
      const search = withSetup()
      await search.load()

      search.goToPage(2)
      await flushPromises()

      expect(gameService.search).toHaveBeenLastCalledWith('', 2)
      expect(search.page.value).toBe(2)
    })

    it.each([-1, 3, 0])('ignores page %s (out of range or the current one)', async (target) => {
      const search = withSetup()
      await search.load()
      gameService.search.mockClear()

      search.goToPage(target)

      expect(gameService.search).not.toHaveBeenCalled()
    })
  })
})
