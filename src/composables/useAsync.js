import { ref } from 'vue'

export function useAsync(loader, initialValue = null) {
  const data = ref(initialValue)
  const isLoading = ref(false)
  const error = ref('')
  const errorStatus = ref(null)

  async function run(...args) {
    isLoading.value = true
    error.value = ''
    errorStatus.value = null
    try {
      data.value = await loader(...args)
    } catch (exception) {
      error.value = exception.message || 'Something went wrong'
      errorStatus.value = exception.status ?? null
    } finally {
      isLoading.value = false
    }
  }

  return { data, isLoading, error, errorStatus, run }
}
