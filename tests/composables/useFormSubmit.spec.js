import { useFormSubmit } from '@/composables/useFormSubmit'
import ApiError from '@/core/http/ApiError'

describe('useFormSubmit', () => {
  it('runs the action when the form is valid', async () => {
    const action = vi.fn().mockResolvedValue()
    const { submit } = useFormSubmit(action, () => ({}))

    expect(await submit()).toBe(true)
    expect(action).toHaveBeenCalledOnce()
  })

  it('does not call the API when client validation fails', async () => {
    const action = vi.fn()
    const { submit, fieldErrors } = useFormSubmit(action, () => ({ username: 'Username cannot be empty' }))

    expect(await submit()).toBe(false)
    expect(action).not.toHaveBeenCalled()
    expect(fieldErrors.value.username).toBe('Username cannot be empty')
  })

  it('shows backend field errors next to their fields', async () => {
    const action = vi.fn().mockRejectedValue(new ApiError(400, 'Validation failed', { email: 'Email is not valid' }))
    const { submit, fieldErrors, error } = useFormSubmit(action)

    await submit()

    expect(fieldErrors.value).toEqual({ email: 'Email is not valid' })
    expect(error.value).toBe('')
  })

  it('shows other backend errors as a general message', async () => {
    const action = vi.fn().mockRejectedValue(new ApiError(401, 'Invalid username or password'))
    const { submit, error } = useFormSubmit(action)

    await submit()

    expect(error.value).toBe('Invalid username or password')
  })

  it('is marked as submitting only while the request is running', async () => {
    let finish
    const action = () => new Promise((resolve) => (finish = resolve))
    const { submit, isSubmitting } = useFormSubmit(action)

    const pending = submit()
    expect(isSubmitting.value).toBe(true)
    finish()
    await pending

    expect(isSubmitting.value).toBe(false)
  })

  it('clears old errors on a new attempt', async () => {
    const action = vi.fn().mockRejectedValueOnce(new ApiError(401, 'Invalid username or password')).mockResolvedValue()
    const { submit, error } = useFormSubmit(action)

    await submit()
    await submit()

    expect(error.value).toBe('')
  })
})
