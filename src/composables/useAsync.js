import { ref } from 'vue'

export function useAsync(loader, initialValue = null) {
  const data = ref(initialValue)
  const isLoading = ref(false)
  const error = ref('')

  async function run(...args) {
    isLoading.value = true
    error.value = ''
    try {
      data.value = await loader(...args)
    } catch (exception) {
      error.value = exception.message || 'Something went wrong'
    } finally {
      isLoading.value = false
    }
  }

  return { data, isLoading, error, run }
}
