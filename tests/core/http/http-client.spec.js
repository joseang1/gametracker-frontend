import ApiError from '@/core/http/ApiError'
import { attachToken, handleError, setUnauthorizedHandler } from '@/core/http/http-client'
import { tokenStorage } from '@/core/http/token-storage'

describe('http-client', () => {
  beforeEach(() => {
    localStorage.clear()
    setUnauthorizedHandler(() => {})
  })

  describe('attachToken', () => {
    it('adds the Bearer header when there is a token', () => {
      tokenStorage.set('abc.def.ghi')

      const config = attachToken({ headers: {} })

      expect(config.headers.Authorization).toBe('Bearer abc.def.ghi')
    })

    it('leaves the request untouched when there is no token', () => {
      const config = attachToken({ headers: {} })

      expect(config.headers.Authorization).toBeUndefined()
    })
  })

  describe('handleError', () => {
    const backendError = (status, data, headers = {}) => ({ response: { status, data }, config: { headers } })

    it('converts the backend error body into an ApiError', async () => {
      const error = backendError(400, { message: 'Validation failed', errors: { email: 'Email is not valid' } })

      const apiError = await handleError(error).catch((e) => e)

      expect(apiError).toBeInstanceOf(ApiError)
      expect(apiError.status).toBe(400)
      expect(apiError.message).toBe('Validation failed')
      expect(apiError.errors).toEqual({ email: 'Email is not valid' })
    })

    it('reports a network error when the server does not answer', async () => {
      const apiError = await handleError({ config: { headers: {} } }).catch((e) => e)

      expect(apiError.status).toBe(0)
    })

    it('calls the unauthorized handler when a sent token is rejected', async () => {
      const handler = vi.fn()
      setUnauthorizedHandler(handler)

      await handleError(backendError(401, { message: 'Expired' }, { Authorization: 'Bearer x' })).catch(() => {})

      expect(handler).toHaveBeenCalledOnce()
    })

    it('does not call the unauthorized handler on a 403 (logged in but not allowed)', async () => {
      const handler = vi.fn()
      setUnauthorizedHandler(handler)

      await handleError(backendError(403, { message: 'Forbidden' }, { Authorization: 'Bearer x' })).catch(() => {})

      expect(handler).not.toHaveBeenCalled()
    })

    it('does not call the unauthorized handler on a failed login (no token sent)', async () => {
      const handler = vi.fn()
      setUnauthorizedHandler(handler)

      await handleError(backendError(401, { message: 'Bad credentials' })).catch(() => {})

      expect(handler).not.toHaveBeenCalled()
    })
  })
})
