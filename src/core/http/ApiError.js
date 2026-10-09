export default class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  static from(error) {
    if (!error.response) return new ApiError(0, 'Cannot reach the server. Is the backend running?')

    const { status, data } = error.response
    return new ApiError(status, data?.message ?? 'Something went wrong', data?.errors ?? {})
  }
}
