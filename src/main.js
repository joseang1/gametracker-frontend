import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import AuthService from './core/apis/auth/AuthService'
import AuthRepository from './core/apis/auth/AuthRepository'
import GameService from './core/apis/games/GameService'
import GameRepository from './core/apis/games/GameRepository'
import ReviewService from './core/apis/reviews/ReviewService'
import ReviewRepository from './core/apis/reviews/ReviewRepository'
import GameLogService from './core/apis/game-logs/GameLogService'
import GameLogRepository from './core/apis/game-logs/GameLogRepository'
import UserService from './core/apis/users/UserService'
import UserRepository from './core/apis/users/UserRepository'
import AdminService from './core/apis/admin/AdminService'
import AdminRepository from './core/apis/admin/AdminRepository'
import { setUnauthorizedHandler } from './core/http/http-client'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.provide('AuthService', new AuthService(new AuthRepository()))
app.provide('GameService', new GameService(new GameRepository()))
app.provide('ReviewService', new ReviewService(new ReviewRepository()))
app.provide('GameLogService', new GameLogService(new GameLogRepository()))
app.provide('UserService', new UserService(new UserRepository()))
app.provide('AdminService', new AdminService(new AdminRepository()))

const authStore = useAuthStore()

setUnauthorizedHandler(() => {
  authStore.logout()
  const current = router.currentRoute.value
  if (current.meta.requiresAuth || current.meta.requiresAdmin)
    router.push({ name: 'login', query: { redirect: current.fullPath } })
})

await authStore.restoreSession()

app.use(router)
app.mount('#app')
