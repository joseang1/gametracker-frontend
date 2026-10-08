import { useAuthStore } from '@/stores/auth'

/**
 * Route meta flags:
 * - requiresAuth: only for logged users (others go to login and come back afterwards)
 * - requiresAdmin: only for admins
 * - guestOnly: login/register, pointless once logged in
 */
export const guard = (to) => {
  const store = useAuthStore()
  const toLogin = { name: 'login', query: { redirect: to.fullPath } }

  if (to.meta.requiresAdmin && !store.isAdmin) return store.isAuthenticated ? { name: 'home' } : toLogin

  if (to.meta.requiresAuth && !store.isAuthenticated) return toLogin

  if (to.meta.guestOnly && store.isAuthenticated) return { name: 'home' }
}
