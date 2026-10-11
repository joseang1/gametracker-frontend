<script setup>
import { computed, inject, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAsync } from '@/composables/useAsync'
import { formatRelativeDate } from '@/core/formatters/relative-date'
import ReviewCard from '@/components/reviews/ReviewCard.vue'
import ConfirmButton from '@/components/ui/ConfirmButton.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const adminService = inject('AdminService')
const route = useRoute()
const router = useRouter()

const stats = reactive(useAsync(() => adminService.getStats()))
const users = reactive(useAsync((search, page) => adminService.getUsers(search, page), { users: [], page: 0, totalPages: 0 }))
const reviews = reactive(useAsync((page) => adminService.getReviews(page), { reviews: [], page: 0, totalPages: 0 }))

const tab = computed(() => (route.query.tab === 'reviews' ? 'reviews' : 'users'))
const search = ref('')
const actionError = ref('')
const busyId = ref(null)

const tiles = computed(() => {
  const data = stats.data ?? {}
  return [
    { label: 'Users', value: data.users },
    { label: 'Banned', value: data.bannedUsers },
    { label: 'Games', value: data.games },
    { label: 'Custom games', value: data.customGames },
    { label: 'Reviews', value: data.reviews },
    { label: 'Logs', value: data.logs },
  ]
})

let timer
watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(() => users.run(search.value, 0), 400)
})
onUnmounted(() => clearTimeout(timer))

watch(
  tab,
  (current) => {
    actionError.value = ''
    if (current === 'users') users.run(search.value, 0)
    else reviews.run(0)
  },
  { immediate: true },
)

onMounted(() => stats.run())

function showTab(name) {
  router.push({ query: name === 'reviews' ? { tab: 'reviews' } : {} })
}

async function runAction(id, action) {
  busyId.value = id
  actionError.value = ''
  try {
    await action()
    stats.run()
  } catch (exception) {
    actionError.value = exception.message
  } finally {
    busyId.value = null
  }
}

function toggleBan(user) {
  return runAction(user.id, async () => {
    const updated = await adminService.setBanned(user.id, !user.banned)
    users.data.users = users.data.users.map((current) => (current.id === updated.id ? updated : current))
  })
}

function deleteReview(review) {
  return runAction(review.id, async () => {
    await adminService.deleteReview(review.id)
    reviews.data.reviews = reviews.data.reviews.filter((current) => current.id !== review.id)
  })
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <header class="mb-8 flex items-center gap-3">
      <span class="grid size-10 place-items-center rounded-lg bg-violet-500/15 text-violet-300">
        <AppIcon name="shield" :size="22" />
      </span>
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">Admin portal</h1>
        <p class="text-sm">Moderate players and reviews.</p>
      </div>
    </header>

    <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" data-test="stats">
      <li v-for="tile in tiles" :key="tile.label" class="rounded-card border border-line bg-surface p-4">
        <span class="block text-xs font-bold tracking-wide text-faint uppercase">{{ tile.label }}</span>
        <span class="mt-1 block font-display text-2xl font-extrabold text-ink">{{ tile.value ?? '–' }}</span>
      </li>
    </ul>

    <nav class="mt-10 flex gap-1 border-b border-line" aria-label="Admin sections">
      <button
        v-for="name in ['users', 'reviews']"
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

    <p
      v-if="actionError"
      class="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-red-300"
      role="alert"
      data-test="action-error"
    >
      {{ actionError }}
    </p>

    <div v-if="tab === 'users'" class="mt-6" data-test="users">
      <label class="relative mb-5 block max-w-sm">
        <span class="sr-only">Search players</span>
        <AppIcon name="search" :size="18" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
        <input
          v-model="search"
          type="search"
          placeholder="Search by username or email…"
          class="w-full rounded-lg border border-line bg-surface py-2.5 pr-3 pl-10 text-ink placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
          data-test="search"
        />
      </label>

      <p v-if="users.error" class="py-10 text-center" role="alert">{{ users.error }}</p>
      <div v-else class="overflow-x-auto rounded-card border border-line">
        <table class="w-full min-w-[42rem] text-left text-sm">
          <thead class="border-b border-line bg-[#0e121b] text-[11px] font-bold tracking-wide text-faint uppercase">
            <tr>
              <th scope="col" class="px-4 py-3">Player</th>
              <th scope="col" class="px-4 py-3">Email</th>
              <th scope="col" class="px-4 py-3">Role</th>
              <th scope="col" class="px-4 py-3">Joined</th>
              <th scope="col" class="px-4 py-3">Status</th>
              <th scope="col" class="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody :class="{ 'opacity-60': users.isLoading }">
            <tr
              v-for="user in users.data.users"
              :key="user.id"
              class="border-b border-line-subtle last:border-0 hover:bg-[#161c28]"
              :data-test="`user-${user.username}`"
            >
              <td class="px-4 py-3">
                <RouterLink :to="`/users/${user.username}`" class="font-semibold text-ink hover:text-accent">
                  {{ user.username }}
                </RouterLink>
              </td>
              <td class="px-4 py-3">{{ user.email }}</td>
              <td class="px-4 py-3">{{ user.isAdmin() ? 'Admin' : 'Player' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ formatRelativeDate(user.createdAt) }}</td>
              <td class="px-4 py-3">
                <span :class="user.banned ? 'text-red-400' : 'text-emerald-400'">{{ user.banned ? 'Banned' : 'Active' }}</span>
              </td>
              <td class="px-4 py-3 text-right">
                <span v-if="user.isAdmin()" class="text-faint" title="Admins cannot be banned">—</span>
                <ConfirmButton
                  v-else
                  :label="user.banned ? 'Unban' : 'Ban'"
                  :confirm-label="user.banned ? 'Click again to unban' : 'Click again to ban'"
                  :disabled="busyId === user.id"
                  data-test="ban"
                  @confirm="toggleBan(user)"
                />
              </td>
            </tr>
            <tr v-if="!users.isLoading && users.data.users.length === 0">
              <td colspan="6" class="px-4 py-10 text-center" data-test="users-empty">No players match “{{ search }}”.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <AppPagination
        class="mt-6"
        :page="users.data.page"
        :total-pages="users.data.totalPages"
        @change="(page) => users.run(search, page)"
      />
    </div>

    <div v-else class="mt-6" data-test="reviews">
      <div v-if="reviews.isLoading" class="grid gap-4 md:grid-cols-2">
        <div v-for="n in 2" :key="n" class="h-44 animate-pulse rounded-card bg-surface" />
      </div>
      <p v-else-if="reviews.error" class="py-10 text-center" role="alert">{{ reviews.error }}</p>
      <p
        v-else-if="reviews.data.reviews.length === 0"
        class="rounded-card border border-dashed border-line py-12 text-center"
        data-test="reviews-empty"
      >
        No reviews to moderate.
      </p>
      <template v-else>
        <ul class="grid gap-4 md:grid-cols-2">
          <li v-for="review in reviews.data.reviews" :key="review.id" class="flex flex-col gap-2">
            <ReviewCard :review="review" show-game clamp />
            <ConfirmButton
              class="self-end"
              label="Delete review"
              confirm-label="Click again to delete"
              :disabled="busyId === review.id"
              data-test="delete-review"
              @confirm="deleteReview(review)"
            />
          </li>
        </ul>
        <AppPagination
          class="mt-8"
          :page="reviews.data.page"
          :total-pages="reviews.data.totalPages"
          @change="(page) => reviews.run(page)"
        />
      </template>
    </div>
  </section>
</template>
