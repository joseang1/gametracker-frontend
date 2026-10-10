import { computed, onScopeDispose, ref, watch } from 'vue'

export function useGameSearch(gameService, { delay = 400, initialTerm = '', initialPage = 0 } = {}) {
  const term = ref(initialTerm)
  const page = ref(initialPage)
  const games = ref([])
  const totalPages = ref(0)
  const isLoading = ref(false)
  const error = ref('')

  const isEmpty = computed(() => !isLoading.value && !error.value && games.value.length === 0)

  let requestId = 0

  async function load() {
    const current = ++requestId
    isLoading.value = true
    error.value = ''

    try {
      const result = await gameService.search(term.value, page.value)
      if (current !== requestId) return
      games.value = result.games
      totalPages.value = result.totalPages
    } catch (exception) {
      if (current !== requestId) return
      games.value = []
      error.value = exception.message
    } finally {
      if (current === requestId) isLoading.value = false
    }
  }

  function goToPage(target) {
    if (target < 0 || target >= totalPages.value || target === page.value) return
    page.value = target
    load()
  }

  let timer
  watch(term, () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      page.value = 0
      load()
    }, delay)
  })

  onScopeDispose(() => clearTimeout(timer))

  return { term, page, games, totalPages, isLoading, error, isEmpty, load, goToPage }
}
