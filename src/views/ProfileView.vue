<script setup>
import { computed, inject, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAsync } from '@/composables/useAsync'
import { LOG_STATUSES, isLogStatus } from '@/core/game-log/log-statuses'
import GameCard from '@/components/games/GameCard.vue'
import GameCardSkeleton from '@/components/games/GameCardSkeleton.vue'
import StatusBadge from '@/components/games/StatusBadge.vue'
import ReviewCard from '@/components/reviews/ReviewCard.vue'
import EditProfileForm from '@/components/profile/EditProfileForm.vue'
import UserAvatar from '@/components/ui/UserAvatar.vue'
import StarRating from '@/components/ui/StarRating.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const userService = inject('UserService')
const gameLogService = inject('GameLogService')
const reviewService = inject('ReviewService')
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const profile = reactive(useAsync((username) => userService.getProfile(username)))
const library = reactive(
  useAsync((username, filter, page) => gameLogService.getByUser(username, { ...filter, page }), {
    logs: [],
    page: 0,
    totalPages: 0,
  }),
)
const reviews = reactive(
  useAsync((username, page) => reviewService.getByUser(username, page), { reviews: [], page: 0, totalPages: 0 }),
)

const filters = [
  { value: 'ALL', label: 'All' },
  ...Object.entries(LOG_STATUSES).map(([value, { label }]) => ({ value, label })),
  { value: 'FAVORITES', label: 'Favourites' },
]

const tab = computed(() => (route.query.tab === 'reviews' ? 'reviews' : 'library'))
const filter = computed(() =>
  route.query.filter === 'FAVORITES' || isLogStatus(route.query.filter) ? route.query.filter : 'ALL',
)
const page = computed(() => {
  const value = Number.parseInt(route.query.page, 10)
  return Number.isInteger(value) && value > 1 ? value - 1 : 0
})

const isOwnProfile = computed(
  () => auth.isAuthenticated && auth.user?.username.toLowerCase() === route.params.username.toLowerCase(),
)
const isEditOpen = ref(false)

const toFilter = (value) => {
  if (value === 'FAVORITES') return { favorites: true }
  if (value === 'ALL') return {}
  return { status: value }
}

watch(
  () => route.params.username,
  (username) => profile.run(username),
  { immediate: true },
)

watch(
  () => [route.params.username, tab.value, filter.value, page.value],
  ([username, currentTab, currentFilter, currentPage]) => {
    if (currentTab === 'library') library.run(username, toFilter(currentFilter), currentPage)
    else reviews.run(username, currentPage)
  },
  { immediate: true },
)

function showTab(name) {
  router.push({ query: name === 'reviews' ? { tab: 'reviews' } : {} })
}

function showFilter(value) {
  router.push({ query: value === 'ALL' ? {} : { filter: value } })
}

function changePage(target) {
  router.push({ query: { ...route.query, page: target > 0 ? String(target + 1) : undefined } })
}

function onProfileSaved(updated) {
  profile.data = updated
  if (auth.user) auth.user.avatarUrl = updated.avatarUrl
  isEditOpen.value = false
}
</script>

<template>
  <div v-if="profile.isLoading && !profile.data" class="mx-auto max-w-7xl animate-pulse px-4 py-12 sm:px-6 lg:px-8" data-test="loading">
    <div class="flex items-center gap-5">
      <div class="size-20 rounded-full bg-raised" />
      <div class="space-y-3">
        <div class="h-8 w-48 rounded bg-raised" />
        <div class="h-4 w-32 rounded bg-raised" />
      </div>
    </div>
  </div>

  <section
    v-else-if="profile.errorStatus === 404"
    class="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-32 text-center"
    data-test="not-found"
  >
    <h1 class="text-2xl font-bold">Player not found</h1>
    <p>There is no player called “{{ route.params.username }}”.</p>
    <RouterLink to="/games" class="btn-primary">Explore games</RouterLink>
  </section>

  <section
    v-else-if="profile.error"
    class="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-32 text-center"
    role="alert"
    data-test="error"
  >
    <p>{{ profile.error }}</p>
    <button type="button" class="btn-secondary" @click="profile.run(route.params.username)">Try again</button>
  </section>

  <div v-else-if="profile.data" class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <header class="flex flex-col gap-6 sm:flex-row sm:items-start">
      <UserAvatar :username="profile.data.username" :avatar-url="profile.data.avatarUrl" size="lg" />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-3xl font-extrabold tracking-tight" data-test="username">{{ profile.data.username }}</h1>
          <span
            v-if="profile.data.isAdmin()"
            class="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] font-bold tracking-wide text-violet-300 uppercase"
            data-test="admin-badge"
          >
            Admin
          </span>
        </div>
        <p class="mt-1 text-sm text-faint">Member since {{ profile.data.getMemberSince() }}</p>
        <p v-if="profile.data.bio" class="mt-3 max-w-2xl whitespace-pre-line" data-test="bio">{{ profile.data.bio }}</p>
        <p v-else-if="isOwnProfile" class="mt-3 text-sm text-faint italic">Add a bio so others know what you like to play.</p>
      </div>
      <button v-if="isOwnProfile" type="button" class="btn-secondary self-start" data-test="edit-profile" @click="isEditOpen = true">
        <AppIcon name="pencil" :size="16" /> Edit profile
      </button>
    </header>

    <ul class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8" data-test="stats">
      <li class="rounded-card border border-line bg-surface p-4">
        <span class="block text-xs font-bold tracking-wide text-faint uppercase">Games</span>
        <span class="mt-1 block font-display text-2xl font-extrabold text-ink">{{ profile.data.getGamesCount() }}</span>
      </li>
      <li v-for="{ status, count } in profile.data.statusCounts" :key="status">
        <button
          type="button"
          class="size-full rounded-card border border-line bg-surface p-4 text-left transition hover:border-accent/40"
          :aria-label="`${count} ${LOG_STATUSES[status].label}, show them`"
          :data-test="`stat-${status}`"
          @click="showFilter(status)"
        >
          <span class="block text-xs font-bold tracking-wide text-faint uppercase">{{ LOG_STATUSES[status].label }}</span>
          <span class="mt-1 block font-display text-2xl font-extrabold text-ink">{{ count }}</span>
        </button>
      </li>
      <li class="rounded-card border border-line bg-surface p-4">
        <span class="block text-xs font-bold tracking-wide text-faint uppercase">Reviews</span>
        <span class="mt-1 block font-display text-2xl font-extrabold text-ink">{{ profile.data.reviewCount }}</span>
      </li>
      <li class="col-span-2 rounded-card border border-line bg-surface p-4 sm:col-span-1">
        <span class="block text-xs font-bold tracking-wide text-faint uppercase">Avg rating</span>
        <span class="mt-2 block" data-test="average">
          <StarRating v-if="profile.data.getAverageStars() !== null" :value="profile.data.getAverageStars()" :size="14" />
          <span v-else class="text-sm">–</span>
        </span>
      </li>
    </ul>

    <nav class="mt-10 flex gap-1 border-b border-line" aria-label="Profile sections">
      <button
        v-for="name in ['library', 'reviews']"
        :key="name"
        type="button"
        class="-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold capitalize transition"
        :class="tab === name ? 'border-accent text-ink' : 'border-transparent hover:text-ink'"
        :aria-current="tab === name ? 'page' : undefined"
        :data-test="`tab-${name}`"
        @click="showTab(name)"
      >
        {{ name }}
      </button>
    </nav>

    <section v-if="tab === 'library'" class="mt-6" data-test="library">
      <div class="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter library">
        <button
          v-for="option in filters"
          :key="option.value"
          type="button"
          class="rounded-full border px-3 py-1 text-sm font-semibold transition"
          :class="filter === option.value ? 'border-accent bg-accent/15 text-accent' : 'border-line text-muted hover:text-ink'"
          :aria-pressed="filter === option.value"
          :data-test="`filter-${option.value}`"
          @click="showFilter(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <div v-if="library.isLoading" class="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <GameCardSkeleton v-for="n in 6" :key="n" />
      </div>
      <p v-else-if="library.error" class="py-12 text-center" role="alert">{{ library.error }}</p>
      <div
        v-else-if="library.data.logs.length === 0"
        class="flex flex-col items-center gap-3 rounded-card border border-dashed border-line px-6 py-14 text-center"
        data-test="library-empty"
      >
        <template v-if="filter !== 'ALL'">
          <p>No games here yet.</p>
        </template>
        <template v-else-if="isOwnProfile">
          <h2 class="text-lg font-semibold">Your library is empty</h2>
          <p class="text-sm">Find a game you played and log it.</p>
          <RouterLink to="/games" class="btn-primary mt-1">Explore games</RouterLink>
        </template>
        <p v-else>{{ profile.data.username }} hasn't logged any games yet.</p>
      </div>
      <template v-else>
        <ul class="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <li v-for="log in library.data.logs" :key="log.id">
            <GameCard :game="log.game" />
            <div class="mt-2 flex items-center gap-2">
              <StatusBadge :status="log.status" />
              <AppIcon
                v-if="log.favorite"
                name="heart"
                :size="14"
                filled
                class="text-red-400"
                role="img"
                aria-label="Favourite"
              />
            </div>
          </li>
        </ul>
        <AppPagination class="mt-10" :page="library.data.page" :total-pages="library.data.totalPages" @change="changePage" />
      </template>
    </section>

    <section v-else class="mt-6" data-test="reviews">
      <div v-if="reviews.isLoading" class="grid gap-4 md:grid-cols-2">
        <div v-for="n in 2" :key="n" class="h-44 animate-pulse rounded-card bg-surface" />
      </div>
      <p v-else-if="reviews.error" class="py-12 text-center" role="alert">{{ reviews.error }}</p>
      <div
        v-else-if="reviews.data.reviews.length === 0"
        class="rounded-card border border-dashed border-line px-6 py-14 text-center"
        data-test="reviews-empty"
      >
        {{ isOwnProfile ? "You haven't reviewed any games yet." : `${profile.data.username} hasn't reviewed any games yet.` }}
      </div>
      <template v-else>
        <ul class="grid gap-4 md:grid-cols-2">
          <li v-for="review in reviews.data.reviews" :key="review.id">
            <ReviewCard :review="review" show-game />
          </li>
        </ul>
        <AppPagination class="mt-10" :page="reviews.data.page" :total-pages="reviews.data.totalPages" @change="changePage" />
      </template>
    </section>

    <AppModal :open="isEditOpen" title="Edit profile" @close="isEditOpen = false">
      <EditProfileForm :profile="profile.data" @saved="onProfileSaved" @cancel="isEditOpen = false" />
    </AppModal>
  </div>
</template>
