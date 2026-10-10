<script setup>
import { computed, inject, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAsync } from '@/composables/useAsync'
import { formatReleaseDate } from '@/core/formatters/release-date'
import RatingHistogram from '@/components/games/RatingHistogram.vue'
import ReviewCard from '@/components/reviews/ReviewCard.vue'
import StarRating from '@/components/ui/StarRating.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const gameService = inject('GameService')
const reviewService = inject('ReviewService')
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const game = reactive(
  useAsync(async () => {
    if (route.params.rawgId) {
      const imported = await gameService.getByRawgId(route.params.rawgId)
      router.replace({ name: 'game', params: { id: imported.id } })
      return imported
    }
    return gameService.getById(route.params.id)
  }),
)

const reviews = reactive(
  useAsync((gameId, page) => reviewService.getByGame(gameId, page), { reviews: [], page: 0, totalPages: 0 }),
)

const LONG_DESCRIPTION = 600
const showFullDescription = ref(false)
const isLongDescription = computed(() => (game.data?.description.length ?? 0) > LONG_DESCRIPTION)
const reviewsSection = ref(null)

watch(
  () => [route.params.id, route.params.rawgId],
  ([id]) => {
    if (id && game.data?.id === Number(id)) return
    showFullDescription.value = false
    game.run()
  },
  { immediate: true },
)

watch(
  () => game.data?.id,
  (id) => {
    if (id) reviews.run(id, 0)
  },
)

function changeReviewsPage(page) {
  reviews.run(game.data.id, page)
  reviewsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div v-if="game.isLoading && !game.data" class="mx-auto max-w-7xl animate-pulse px-4 py-12 sm:px-6 lg:px-8" data-test="loading">
    <div class="grid gap-8 md:grid-cols-[16rem_1fr]">
      <div class="aspect-[2/3] rounded-xl bg-raised" />
      <div class="space-y-4 pt-4">
        <div class="h-10 w-2/3 rounded bg-raised" />
        <div class="h-4 w-1/3 rounded bg-raised" />
        <div class="h-24 w-full max-w-md rounded bg-raised" />
      </div>
    </div>
  </div>

  <section
    v-else-if="game.errorStatus === 404"
    class="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-32 text-center"
    data-test="not-found"
  >
    <h1 class="text-2xl font-bold">Game not found</h1>
    <p>We couldn't find this game. It may have been removed.</p>
    <RouterLink to="/games" class="btn-primary">Explore games</RouterLink>
  </section>

  <section
    v-else-if="game.error"
    class="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-32 text-center"
    role="alert"
    data-test="error"
  >
    <span class="grid size-12 place-items-center rounded-full bg-danger/10 text-danger">
      <AppIcon name="alert" :size="24" />
    </span>
    <p>{{ game.error }}</p>
    <button type="button" class="btn-secondary" @click="game.run()">Try again</button>
  </section>

  <article v-else-if="game.data">
    <header class="relative isolate overflow-hidden border-b border-line-subtle">
      <img
        v-if="game.data.coverUrl"
        :src="game.data.coverUrl"
        alt=""
        class="absolute inset-0 -z-20 size-full scale-110 object-cover opacity-25 blur-2xl"
        aria-hidden="true"
      />
      <div class="absolute inset-0 -z-10 bg-gradient-to-b from-canvas/40 via-canvas/80 to-canvas" aria-hidden="true" />

      <div class="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[16rem_1fr] md:py-14 lg:px-8">
        <div class="mx-auto w-48 md:w-full">
          <img
            v-if="game.data.coverUrl"
            :src="game.data.coverUrl"
            :alt="`${game.data.title} cover`"
            class="aspect-[2/3] w-full rounded-xl border border-line object-cover shadow-2xl shadow-black/60"
          />
          <div v-else class="grid aspect-[2/3] w-full place-items-center rounded-xl border border-line bg-raised text-faint">
            <AppIcon name="gamepad" :size="48" />
          </div>
        </div>

        <div class="flex flex-col gap-6">
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl" data-test="title">
              {{ game.data.title }}
            </h1>
            <p class="mt-2 text-sm">
              <span class="font-semibold text-ink">{{ game.data.getYear() ?? 'TBA' }}</span>
              <template v-if="game.data.developer"> · by {{ game.data.developer }}</template>
            </p>
            <ul v-if="game.data.genres.length" class="mt-4 flex flex-wrap gap-2">
              <li
                v-for="genre in game.data.genres"
                :key="genre"
                class="rounded-md border border-info/25 bg-info/10 px-2 py-0.5 text-xs font-semibold text-info"
              >
                {{ genre }}
              </li>
            </ul>
          </div>

          <div class="grid max-w-xl gap-6 rounded-card border border-line bg-surface/80 p-5 backdrop-blur sm:grid-cols-[auto_1fr]">
            <div data-test="community-rating">
              <p class="text-xs font-bold tracking-wide text-faint uppercase">Community rating</p>
              <template v-if="game.data.stats.hasReviews()">
                <p class="mt-1 font-display text-4xl font-extrabold text-ink">{{ game.data.stats.getAverageStars() }}</p>
                <StarRating :value="game.data.stats.getAverageStars()" :size="14" />
                <p class="mt-1 text-xs">
                  {{ game.data.stats.reviewCount }} {{ game.data.stats.reviewCount === 1 ? 'review' : 'reviews' }}
                </p>
              </template>
              <p v-else class="mt-2 text-sm">Not rated yet</p>
            </div>
            <RatingHistogram :stats="game.data.stats" class="self-end" />
          </div>

          <RouterLink
            v-if="!auth.isAuthenticated"
            :to="{ name: 'login', query: { redirect: route.fullPath } }"
            class="btn-primary self-start"
            data-test="login-cta"
          >
            Log in to log, rate and review
          </RouterLink>
        </div>
      </div>
    </header>

    <div class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_18rem] lg:px-8">
      <div class="flex min-w-0 flex-col gap-12">
        <section v-if="game.data.description" aria-labelledby="about">
          <h2 id="about" class="mb-3 text-xl font-bold">About</h2>
          <p
            class="leading-relaxed whitespace-pre-line"
            :class="{ 'line-clamp-6': isLongDescription && !showFullDescription }"
            data-test="description"
          >
            {{ game.data.description }}
          </p>
          <button
            v-if="isLongDescription"
            type="button"
            class="mt-2 text-sm font-semibold text-accent hover:underline"
            data-test="toggle-description"
            @click="showFullDescription = !showFullDescription"
          >
            {{ showFullDescription ? 'Show less' : 'Read more' }}
          </button>
        </section>

        <section ref="reviewsSection" class="scroll-mt-24" aria-labelledby="reviews">
          <h2 id="reviews" class="mb-5 text-xl font-bold">Reviews</h2>

          <div v-if="reviews.isLoading" class="space-y-4" data-test="reviews-loading">
            <div v-for="n in 2" :key="n" class="h-36 animate-pulse rounded-card bg-surface" />
          </div>
          <p v-else-if="reviews.error" class="rounded-card border border-line bg-surface p-6 text-center" data-test="reviews-error">
            Reviews are not available right now.
          </p>
          <div
            v-else-if="reviews.data.reviews.length === 0"
            class="rounded-card border border-dashed border-line px-6 py-12 text-center"
            data-test="reviews-empty"
          >
            <h3 class="font-semibold">No reviews yet</h3>
            <p class="mt-1 text-sm">Be the first to share what you think about {{ game.data.title }}.</p>
          </div>
          <template v-else>
            <ul class="space-y-4">
              <li v-for="review in reviews.data.reviews" :key="review.id">
                <ReviewCard :review="review" />
              </li>
            </ul>
            <AppPagination
              class="mt-8"
              :page="reviews.data.page"
              :total-pages="reviews.data.totalPages"
              @change="changeReviewsPage"
            />
          </template>
        </section>
      </div>

      <aside class="lg:pt-10">
        <dl class="space-y-5 rounded-card border border-line bg-surface p-5 text-sm" data-test="details">
          <div>
            <dt class="text-xs font-bold tracking-wide text-faint uppercase">Release date</dt>
            <dd class="mt-1 text-ink">{{ formatReleaseDate(game.data.releaseDate) }}</dd>
          </div>
          <div v-if="game.data.developer">
            <dt class="text-xs font-bold tracking-wide text-faint uppercase">Developer</dt>
            <dd class="mt-1 text-ink">{{ game.data.developer }}</dd>
          </div>
          <div v-if="game.data.platforms.length">
            <dt class="text-xs font-bold tracking-wide text-faint uppercase">Platforms</dt>
            <dd class="mt-2 flex flex-wrap gap-1.5">
              <span
                v-for="platform in game.data.platforms"
                :key="platform"
                class="rounded-md border border-line bg-raised px-2 py-0.5 text-xs text-ink"
              >
                {{ platform }}
              </span>
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  </article>
</template>
