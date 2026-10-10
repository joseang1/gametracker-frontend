<script setup>
import { computed } from 'vue'
import RatingStatsModel from '@/core/models/RatingStatsModel'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  stats: { type: RatingStatsModel, required: true },
  highlight: { type: Number, default: null },
})

const bars = computed(() =>
  props.stats.getBarHeights().map((height, index) => {
    const count = props.stats.distribution[index]
    const percent = props.stats.reviewCount === 0 ? 0 : Math.round((count / props.stats.reviewCount) * 100)
    return { rating: index + 1, stars: (index + 1) / 2, count, percent, height: Math.max(height * 100, 4) }
  }),
)
</script>

<template>
  <div>
    <ul class="flex h-24 items-end gap-1" aria-label="Rating distribution">
      <li
        v-for="bar in bars"
        :key="bar.rating"
        class="group relative h-full flex-1"
        :aria-label="`${bar.stars} stars: ${bar.count} ${bar.count === 1 ? 'review' : 'reviews'}`"
        data-test="bar"
      >
        <div class="relative h-full overflow-hidden rounded-sm bg-raised">
          <div
            class="absolute bottom-0 w-full rounded-sm transition"
            :class="bar.rating === highlight ? 'bg-accent' : 'bg-slate-600 group-hover:bg-slate-500'"
            :style="{ height: `${bar.height}%` }"
            data-test="bar-fill"
          />
        </div>
        <span
          class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md border border-line bg-overlay px-2 py-1 text-xs whitespace-nowrap text-ink opacity-0 shadow-lg transition group-hover:opacity-100"
          aria-hidden="true"
        >
          {{ bar.stars }}★ · {{ bar.count }} ({{ bar.percent }}%)
        </span>
      </li>
    </ul>
    <div class="mt-1.5 flex justify-between text-xs text-faint" aria-hidden="true">
      <span class="flex items-center gap-0.5">½<AppIcon name="star" :size="10" filled class="text-star" /></span>
      <span class="flex items-center gap-0.5">5<AppIcon name="star" :size="10" filled class="text-star" /></span>
    </div>
  </div>
</template>
