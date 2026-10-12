<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import GameModel from '@/core/models/GameModel'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  game: { type: GameModel, required: true },
})

const imageFailed = ref(false)
const showCover = computed(() => Boolean(props.game.coverUrl) && !imageFailed.value)

const stars = computed(() => props.game.getStars())
const meta = computed(() => [props.game.getYear() ?? 'TBA', ...props.game.genres.slice(0, 2)].join(' · '))
</script>

<template>
  <RouterLink
    :to="game.getDetailRoute()"
    class="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
  >
    <div
      class="relative aspect-[2/3] overflow-hidden rounded-lg border border-line bg-raised transition duration-300 group-hover:-translate-y-1 group-hover:border-accent/40 group-hover:shadow-[0_8px_24px_-4px_rgb(0_0_0/0.6),0_0_16px_-2px_rgb(16_185_129/0.2)]"
    >
      <img
        v-if="showCover"
        :src="game.coverUrl"
        :alt="`${game.title} cover`"
        loading="lazy"
        class="size-full object-cover transition duration-500 group-hover:scale-105"
        data-test="cover"
        @error="imageFailed = true"
      />
      <div v-else class="grid size-full place-items-center bg-gradient-to-br from-raised to-overlay text-faint" data-test="cover-placeholder">
        <AppIcon name="gamepad" :size="40" />
      </div>

      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/10 to-transparent opacity-0 transition group-hover:opacity-100"
        aria-hidden="true"
      />

      <span
        v-if="stars !== null"
        class="absolute top-2 right-2 flex items-center gap-1 rounded-full border border-line/60 bg-surface/85 px-2 py-0.5 text-xs font-bold text-ink backdrop-blur"
        :aria-label="`Rated ${stars.toFixed(1)} out of 5`"
        data-test="rating"
      >
        <AppIcon name="star" :size="12" filled class="text-star" />
        {{ stars.toFixed(1) }}
      </span>
    </div>

    <h3 class="mt-2.5 line-clamp-2 text-sm leading-snug font-semibold transition group-hover:text-accent">
      {{ game.title }}
    </h3>
    <p class="mt-0.5 truncate text-xs text-faint">{{ meta }}</p>
  </RouterLink>
</template>
