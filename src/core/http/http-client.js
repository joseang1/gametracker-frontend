import axios from 'axios'
import ApiError from './ApiError'
import { tokenStorage } from './token-storage'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
})

export function attachToken(config) {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}

/*
 * Called when the backend rejects our token with a 401: it expired, the user was banned
 * or deleted. A 403 is not handled here: it only means "not allowed" (e.g. not an admin).
 */
let onUnauthorized = () => {}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

export function handleError(error) {
  const apiError = ApiError.from(error)
  const sentToken = Boolean(error.config?.headers?.Authorization)

  if (sentToken && apiError.status === 401) onUnauthorized(apiError)

  return Promise.reject(apiError)
}

httpClient.interceptors.request.use(attachToken)
httpClient.interceptors.response.use((response) => response, handleError)

export default httpClient
