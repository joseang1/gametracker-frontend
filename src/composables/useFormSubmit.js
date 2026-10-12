import { ref } from 'vue'

export function useFormSubmit(action, validate = () => ({})) {
  const isSubmitting = ref(false)
  const error = ref('')
  const fieldErrors = ref({})

  async function submit() {
    error.value = ''
    fieldErrors.value = validate()
    if (Object.keys(fieldErrors.value).length > 0) return false

    isSubmitting.value = true
    try {
      await action()
      return true
    } catch (exception) {
      if (exception.errors && Object.keys(exception.errors).length > 0) fieldErrors.value = exception.errors
      else error.value = exception.message || 'Something went wrong'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return { submit, isSubmitting, error, fieldErrors }
}
