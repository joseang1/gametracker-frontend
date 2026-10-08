import { ref } from 'vue'

/**
 * Shared submit logic for every form:
 * - validate(): returns { field: message } with client-side errors (empty object = valid)
 * - action(): the API call; an ApiError with field errors fills fieldErrors,
 *   any other error message goes to error
 */
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
