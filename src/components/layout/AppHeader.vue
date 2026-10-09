<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDisclosure } from '@/composables/useDisclosure'
import { useClickOutside } from '@/composables/useClickOutside'
import AppIcon from '@/components/ui/AppIcon.vue'
import UserAvatar from '@/components/ui/UserAvatar.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu, close: closeMobileMenu } = useDisclosure()
const { isOpen: isUserMenuOpen, toggle: toggleUserMenu, close: closeUserMenu } = useDisclosure()

const userMenu = ref(null)
useClickOutside(userMenu, closeUserMenu)

watch(
  () => route.fullPath,
  () => {
    closeMobileMenu()
    closeUserMenu()
  },
)

const links = [{ label: 'Explore', to: '/games' }]

function logout() {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line-subtle bg-canvas/85 backdrop-blur-md">
    <nav class="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8" aria-label="Main">
      <RouterLink to="/" class="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
        <span class="grid size-8 place-items-center rounded-lg bg-accent/15 text-accent">
          <AppIcon name="gamepad" :size="20" />
        </span>
        GameTracker
      </RouterLink>

      <ul class="hidden items-center gap-1 md:flex">
        <li v-for="link in links" :key="link.to">
          <RouterLink
            :to="link.to"
            class="rounded-md px-3 py-2 text-sm font-medium transition hover:bg-raised hover:text-ink"
            active-class="text-ink"
          >
            {{ link.label }}
          </RouterLink>
        </li>
      </ul>

      <div class="ml-auto hidden items-center gap-2 md:flex">
        <template v-if="auth.isAuthenticated">
          <div ref="userMenu" class="relative">
            <button
              type="button"
              class="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition hover:bg-raised"
              :aria-expanded="isUserMenuOpen"
              aria-haspopup="menu"
              data-test="user-menu-button"
              @click="toggleUserMenu"
            >
              <UserAvatar :username="auth.user.username" :avatar-url="auth.user.avatarUrl" size="sm" />
              <span class="text-sm font-semibold text-ink">{{ auth.user.username }}</span>
              <AppIcon name="chevron-down" :size="16" class="transition" :class="{ 'rotate-180': isUserMenuOpen }" />
            </button>

            <div
              v-if="isUserMenuOpen"
              class="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-raised py-1 shadow-2xl shadow-black/60"
              role="menu"
              data-test="user-menu"
            >
              <RouterLink :to="`/users/${auth.user.username}`" class="menu-item" role="menuitem">
                <AppIcon name="user" :size="16" /> My profile
              </RouterLink>
              <RouterLink v-if="auth.isAdmin" to="/admin" class="menu-item" role="menuitem" data-test="admin-link">
                <AppIcon name="shield" :size="16" /> Admin portal
              </RouterLink>
              <hr class="my-1 border-line" />
              <button type="button" class="menu-item w-full text-danger" role="menuitem" @click="logout">
                <AppIcon name="logout" :size="16" /> Log out
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <RouterLink to="/login" class="btn-ghost">Log in</RouterLink>
          <RouterLink to="/register" class="btn-primary">Sign up</RouterLink>
        </template>
      </div>

      <button
        type="button"
        class="ml-auto rounded-md p-2 text-ink transition hover:bg-raised md:hidden"
        :aria-expanded="isMobileMenuOpen"
        aria-controls="mobile-menu"
        :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
        data-test="mobile-menu-button"
        @click="toggleMobileMenu"
      >
        <AppIcon :name="isMobileMenuOpen ? 'close' : 'menu'" :size="22" />
      </button>
    </nav>

    <div v-if="isMobileMenuOpen" id="mobile-menu" class="border-t border-line-subtle px-4 pt-2 pb-4 md:hidden">
      <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="menu-item rounded-md">
        {{ link.label }}
      </RouterLink>

      <hr class="my-2 border-line-subtle" />

      <template v-if="auth.isAuthenticated">
        <div class="flex items-center gap-3 px-3 py-2">
          <UserAvatar :username="auth.user.username" :avatar-url="auth.user.avatarUrl" size="sm" />
          <span class="font-semibold text-ink">{{ auth.user.username }}</span>
        </div>
        <RouterLink :to="`/users/${auth.user.username}`" class="menu-item rounded-md">My profile</RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin" class="menu-item rounded-md">Admin portal</RouterLink>
        <button type="button" class="menu-item w-full rounded-md text-danger" @click="logout">Log out</button>
      </template>

      <div v-else class="grid grid-cols-2 gap-2 pt-1">
        <RouterLink to="/login" class="btn-secondary">Log in</RouterLink>
        <RouterLink to="/register" class="btn-primary">Sign up</RouterLink>
      </div>
    </div>
  </header>
</template>
