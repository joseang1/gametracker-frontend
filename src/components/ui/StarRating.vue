<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  value: { type: Number, required: true },
  size: { type: Number, default: 16 },
})

const fills = computed(() => [0, 1, 2, 3, 4].map((index) => Math.min(Math.max(props.value - index, 0), 1)))
</script>

<template>
  <span class="inline-flex items-center gap-0.5" role="img" :aria-label="`Rated ${value} out of 5`">
    <span v-for="(fill, index) in fills" :key="index" class="relative inline-block" data-test="star">
      <AppIcon name="star" :size="size" filled class="text-line" />
      <span class="absolute inset-0 overflow-hidden" :style="{ width: `${fill * 100}%` }" data-test="star-fill">
        <AppIcon name="star" :size="size" filled class="text-star" />
      </span>
    </span>
  </span>
</template>
