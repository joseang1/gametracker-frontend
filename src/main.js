import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import AuthService from './core/apis/auth/AuthService'
import AuthRepository from './core/apis/auth/AuthRepository'
import { setUnauthorizedHandler } from './core/http/http-client'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.provide('AuthService', new AuthService(new AuthRepository()))

const authStore = useAuthStore()

// The backend rejected our token (expired or banned): end the session
setUnauthorizedHandler(() => {
  authStore.logout()
  const current = router.currentRoute.value
  if (current.meta.requiresAuth || current.meta.requiresAdmin)
    router.push({ name: 'login', query: { redirect: current.fullPath } })
})

// Restore the session before the first navigation so guards know who is logged in
await authStore.restoreSession()

app.use(router)
app.mount('#app')
