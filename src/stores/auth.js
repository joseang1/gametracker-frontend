import { computed, inject, ref } from 'vue'
import { defineStore } from 'pinia'
import { tokenStorage } from '@/core/http/token-storage'

export const useAuthStore = defineStore('auth', () => {
  const authService = inject('AuthService')

  const token = ref(tokenStorage.get())
  const user = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const isAdmin = computed(() => Boolean(user.value?.isAdmin()))

  function startSession(session) {
    token.value = session.token
    user.value = session.user
    tokenStorage.set(session.token)
  }

  async function login(username, password) {
    startSession(await authService.login(username, password))
  }

  async function register(username, email, password) {
    startSession(await authService.register(username, email, password))
  }

  function logout() {
    token.value = null
    user.value = null
    tokenStorage.clear()
  }

  async function restoreSession() {
    if (!token.value) return

    try {
      user.value = await authService.getCurrentUser()
    } catch {
      logout()
    }
  }

  return { token, user, isAuthenticated, isAdmin, login, register, logout, restoreSession }
})
