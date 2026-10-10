<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ReviewModel from '@/core/models/ReviewModel'
import { formatRelativeDate } from '@/core/formatters/relative-date'
import UserAvatar from '@/components/ui/UserAvatar.vue'
import StarRating from '@/components/ui/StarRating.vue'

const props = defineProps({
  review: { type: ReviewModel, required: true },
  showGame: { type: Boolean, default: false },
  clamp: { type: Boolean, default: false },
})

const revealed = ref(false)
const isHidden = computed(() => props.review.spoiler && !revealed.value)
const date = computed(() => formatRelativeDate(props.review.createdAt))
</script>

<template>
  <article class="flex h-full flex-col gap-4 rounded-card border border-line bg-surface p-5">
    <header class="flex items-start gap-3">
      <RouterLink :to="`/users/${review.author.username}`" class="shrink-0">
        <UserAvatar :username="review.author.username" :avatar-url="review.author.avatarUrl" />
      </RouterLink>
      <div class="min-w-0 flex-1">
        <RouterLink
          :to="`/users/${review.author.username}`"
          class="font-display font-semibold text-ink hover:text-accent"
          data-test="author"
        >
          {{ review.author.username }}
        </RouterLink>
        <p class="text-xs text-faint">
          <time :datetime="review.createdAt">{{ date }}</time>
          <span v-if="review.wasEdited()"> · edited</span>
        </p>
      </div>
      <StarRating :value="review.getStars()" :size="14" class="mt-1 shrink-0" />
    </header>

    <RouterLink
      v-if="showGame"
      :to="review.game.getDetailRoute()"
      class="flex items-center gap-3 rounded-lg bg-raised/60 p-2 transition hover:bg-raised"
      data-test="game"
    >
      <img
        v-if="review.game.coverUrl"
        :src="review.game.coverUrl"
        :alt="`${review.game.title} cover`"
        loading="lazy"
        class="h-12 w-9 shrink-0 rounded object-cover"
      />
      <span class="min-w-0">
        <span class="block truncate text-sm font-semibold text-ink">{{ review.game.title }}</span>
        <span v-if="review.game.getYear()" class="text-xs text-faint">{{ review.game.getYear() }}</span>
      </span>
    </RouterLink>

    <div v-if="review.hasBody()" class="relative">
      <p
        class="text-sm leading-relaxed whitespace-pre-line"
        :class="{ 'blur-sm select-none': isHidden, 'line-clamp-4': clamp }"
        :aria-hidden="isHidden"
        data-test="body"
      >
        {{ review.body }}
      </p>
      <button
        v-if="isHidden"
        type="button"
        class="absolute inset-0 flex items-center justify-center rounded-lg text-sm font-semibold text-ink"
        data-test="reveal"
        @click="revealed = true"
      >
        <span class="rounded-full border border-line bg-raised px-3 py-1">Contains spoilers · Show</span>
      </button>
    </div>
    <p v-else class="text-sm text-faint italic" data-test="rating-only">Rated without a written review.</p>
  </article>
</template>
