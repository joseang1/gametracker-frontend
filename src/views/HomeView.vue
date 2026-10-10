<script setup>
import { computed, inject, onMounted, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAsync } from '@/composables/useAsync'
import GameCard from '@/components/games/GameCard.vue'
import GameCardSkeleton from '@/components/games/GameCardSkeleton.vue'
import StatusBadge from '@/components/games/StatusBadge.vue'
import ReviewCard from '@/components/reviews/ReviewCard.vue'
import StarRating from '@/components/ui/StarRating.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const gameService = inject('GameService')
const reviewService = inject('ReviewService')
const auth = useAuthStore()

const trending = reactive(useAsync(() => gameService.getTrending(), []))
const recentReviews = reactive(useAsync(async () => (await reviewService.getRecent()).reviews.slice(0, 6), []))

const heroCovers = computed(() => trending.data.filter((game) => game.coverUrl).slice(0, 3))

const steps = [
  { title: 'Log every game', text: 'Keep track of what you are playing, what you finished and what is waiting in your backlog.' },
  { title: 'Rate with half stars', text: 'From a masterpiece to a disappointment, give every game the score it deserves.' },
  { title: 'Write reviews', text: 'Share what you loved, hide spoilers, and read what the community thinks.' },
]

onMounted(() => {
  trending.run()
  recentReviews.run()
})
</script>

<template>
  <div>
    <section class="relative isolate overflow-hidden">
      <div
        class="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[48rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />
      <div class="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div>
          <p class="mb-4 text-sm font-semibold tracking-wide text-accent uppercase">Your gaming diary</p>
          <h1 class="text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Every game you play,
            <span class="bg-gradient-to-r from-accent to-info bg-clip-text text-transparent">remembered.</span>
          </h1>
          <p class="mt-5 max-w-lg text-lg">
            Log the games you play, rate them, and review them. Find your next favourite through what the community
            is playing.
          </p>

          <div class="mt-8 flex flex-wrap gap-3" data-test="hero-actions">
            <template v-if="auth.isAuthenticated">
              <RouterLink to="/games" class="btn-primary px-5 py-3">Explore games</RouterLink>
              <RouterLink :to="`/users/${auth.user.username}`" class="btn-secondary px-5 py-3">My profile</RouterLink>
            </template>
            <template v-else>
              <RouterLink to="/register" class="btn-primary px-5 py-3">Create free account</RouterLink>
              <RouterLink to="/games" class="btn-secondary px-5 py-3">Explore games</RouterLink>
            </template>
          </div>
        </div>

        <div class="relative hidden h-[26rem] lg:block" aria-hidden="true">
          <img
            v-for="(game, index) in heroCovers"
            :key="game.rawgId"
            :src="game.coverUrl"
            alt=""
            class="absolute top-1/2 left-1/2 h-80 w-56 origin-bottom rounded-xl border border-line object-cover shadow-2xl shadow-black/60"
            :class="[
              index === 0 && '-translate-x-[95%] -translate-y-[45%] -rotate-8',
              index === 1 && 'z-10 -translate-x-1/2 -translate-y-1/2',
              index === 2 && '-translate-x-[5%] -translate-y-[45%] rotate-8',
            ]"
            data-test="hero-cover"
          />
          <div
            v-if="heroCovers.length === 0"
            class="absolute top-1/2 left-1/2 h-80 w-56 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-gradient-to-br from-raised to-overlay"
          />
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8" aria-labelledby="how-it-works">
      <h2 id="how-it-works" class="sr-only">How it works</h2>
      <ol class="grid gap-4 md:grid-cols-3">
        <li v-for="(step, index) in steps" :key="step.title" class="rounded-card border border-line bg-surface p-6">
          <div class="mb-5 flex min-h-8 flex-wrap items-center gap-2">
            <template v-if="index === 0">
              <StatusBadge status="PLAYING" />
              <StatusBadge status="COMPLETED" />
              <StatusBadge status="BACKLOG" />
            </template>
            <StarRating v-else-if="index === 1" :value="4.5" :size="20" />
            <span v-else class="flex items-center gap-2 text-sm text-faint">
              <AppIcon name="eye-off" :size="18" /> Spoilers stay hidden
            </span>
          </div>
          <h3 class="text-lg font-bold">{{ step.title }}</h3>
          <p class="mt-1 text-sm leading-relaxed">{{ step.text }}</p>
        </li>
      </ol>
    </section>

    <section class="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8" aria-labelledby="trending">
      <div class="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 id="trending" class="text-2xl font-bold">Trending now</h2>
          <p class="text-sm">What players are adding to their lists.</p>
        </div>
        <RouterLink to="/games" class="flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
          See all <AppIcon name="chevron-right" :size="16" />
        </RouterLink>
      </div>

      <div
        v-if="trending.isLoading"
        class="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        data-test="trending-loading"
      >
        <GameCardSkeleton v-for="n in 12" :key="n" />
      </div>
      <div
        v-else-if="trending.error"
        class="flex flex-col items-center gap-3 rounded-card border border-line bg-surface py-12 text-center"
        data-test="trending-error"
      >
        <p>Trending games are not available right now.</p>
        <button type="button" class="btn-secondary" @click="trending.run()">Try again</button>
      </div>
      <ul v-else class="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <li v-for="game in trending.data" :key="game.id ?? `rawg-${game.rawgId}`">
          <GameCard :game="game" />
        </li>
      </ul>
    </section>

    <section class="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8" aria-labelledby="recent-reviews">
      <h2 id="recent-reviews" class="mb-6 text-2xl font-bold">Recent reviews</h2>

      <div v-if="recentReviews.isLoading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-test="reviews-loading">
        <div v-for="n in 3" :key="n" class="h-44 animate-pulse rounded-card bg-surface" />
      </div>
      <p
        v-else-if="recentReviews.error"
        class="rounded-card border border-line bg-surface py-12 text-center"
        data-test="reviews-error"
      >
        Reviews are not available right now.
      </p>
      <div
        v-else-if="recentReviews.data.length === 0"
        class="flex flex-col items-center gap-3 rounded-card border border-dashed border-line py-14 text-center"
        data-test="reviews-empty"
      >
        <h3 class="text-lg font-semibold">No reviews yet</h3>
        <p class="max-w-sm text-sm">The community is just getting started. Pick a game and write the first review.</p>
        <RouterLink to="/games" class="btn-secondary mt-1">Find a game</RouterLink>
      </div>
      <ul v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <li v-for="review in recentReviews.data" :key="review.id">
          <ReviewCard :review="review" show-game clamp />
        </li>
      </ul>
    </section>

    <section v-if="!auth.isAuthenticated" class="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8" data-test="final-cta">
      <div
        class="relative isolate overflow-hidden rounded-hero border border-accent/20 bg-gradient-to-br from-accent/15 via-surface to-info/10 px-6 py-14 text-center sm:px-12"
      >
        <h2 class="text-3xl font-extrabold">Start your gaming diary</h2>
        <p class="mx-auto mt-3 max-w-md">Free, no ads. Just you and the games you love.</p>
        <RouterLink to="/register" class="btn-primary mt-7 px-6 py-3">Create free account</RouterLink>
      </div>
    </section>
  </div>
</template>
