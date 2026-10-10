<script setup>
import { inject, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameSearch } from '@/composables/useGameSearch'
import GameCard from '@/components/games/GameCard.vue'
import GameCardSkeleton from '@/components/games/GameCardSkeleton.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const gameService = inject('GameService')
const route = useRoute()
const router = useRouter()

const pageFromUrl = Number.parseInt(route.query.page, 10)

const { term, page, games, totalPages, isLoading, error, isEmpty, load, goToPage } = useGameSearch(gameService, {
  initialTerm: typeof route.query.q === 'string' ? route.query.q : '',
  initialPage: Number.isInteger(pageFromUrl) && pageFromUrl > 1 ? pageFromUrl - 1 : 0,
})

watch([term, page], () => {
  const query = {}
  if (term.value.trim()) query.q = term.value.trim()
  if (page.value > 0) query.page = String(page.value + 1)
  router.replace({ query })
})

function changePage(target) {
  goToPage(target)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(load)
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <header class="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">Explore games</h1>
        <p class="mt-1">Search thousands of games and find your next one to play.</p>
      </div>

      <label class="relative block w-full md:max-w-sm">
        <span class="sr-only">Search games</span>
        <AppIcon name="search" :size="18" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
        <input
          v-model="term"
          type="search"
          placeholder="Search by title…"
          autocomplete="off"
          class="w-full rounded-lg border border-line bg-surface py-2.5 pr-3 pl-10 text-ink transition placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
          data-test="search"
        />
      </label>
    </header>

    <div
      v-if="isLoading"
      class="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      aria-busy="true"
      data-test="loading"
    >
      <GameCardSkeleton v-for="n in 12" :key="n" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center gap-4 py-20 text-center" role="alert" data-test="error">
      <span class="grid size-12 place-items-center rounded-full bg-danger/10 text-danger">
        <AppIcon name="alert" :size="24" />
      </span>
      <p class="max-w-sm">{{ error }}</p>
      <button type="button" class="btn-secondary" @click="load">Try again</button>
    </div>

    <div v-else-if="isEmpty" class="flex flex-col items-center gap-3 py-20 text-center" data-test="empty">
      <span class="grid size-12 place-items-center rounded-full bg-raised text-faint">
        <AppIcon name="search" :size="22" />
      </span>
      <h2 class="text-lg font-semibold">No games found</h2>
      <p v-if="term.trim()">Nothing matches “{{ term.trim() }}”. Try another title.</p>
    </div>

    <template v-else>
      <ul class="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <li v-for="game in games" :key="game.id ?? `rawg-${game.rawgId}`">
          <GameCard :game="game" />
        </li>
      </ul>

      <AppPagination class="mt-12" :page="page" :total-pages="totalPages" @change="changePage" />
    </template>
  </section>
</template>
