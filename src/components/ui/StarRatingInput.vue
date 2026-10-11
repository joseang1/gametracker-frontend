<script setup>
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const model = defineModel({ type: Number, default: null })

defineProps({
  size: { type: Number, default: 32 },
  label: { type: String, default: 'Your rating' },
})

const hovered = ref(null)
const shown = computed(() => hovered.value ?? model.value ?? 0)

const valueOf = (star, half) => star * 2 - 2 + half
const fillFor = (star) => Math.min(Math.max(shown.value / 2 - (star - 1), 0), 1)

function choose(value) {
  model.value = model.value === value ? null : value
}

function onKeydown(event) {
  const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key]
  if (!step) return
  event.preventDefault()
  model.value = Math.min(Math.max((model.value ?? 0) + step, 1), 10)
}
</script>

<template>
  <div class="flex items-center gap-3">
    <div
      class="inline-flex items-center gap-1"
      role="radiogroup"
      :aria-label="label"
      data-test="stars"
      @mouseleave="hovered = null"
      @keydown="onKeydown"
    >
      <span v-for="star in 5" :key="star" class="relative inline-block">
        <AppIcon name="star" :size="size" filled class="text-line" />
        <span class="pointer-events-none absolute inset-0 overflow-hidden" :style="{ width: `${fillFor(star) * 100}%` }">
          <AppIcon name="star" :size="size" filled class="text-star drop-shadow-[0_0_6px_rgb(245_158_11/0.45)]" />
        </span>
        <button
          v-for="half in [1, 2]"
          :key="half"
          type="button"
          role="radio"
          class="absolute inset-y-0 w-1/2 cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-accent"
          :class="half === 1 ? 'left-0' : 'right-0'"
          :aria-checked="model === valueOf(star, half)"
          :aria-label="`${valueOf(star, half) / 2} stars`"
          :tabindex="(model ?? 1) === valueOf(star, half) ? 0 : -1"
          @mouseenter="hovered = valueOf(star, half)"
          @click="choose(valueOf(star, half))"
        />
      </span>
    </div>
    <span class="min-w-10 font-display text-lg font-bold text-ink tabular-nums" aria-live="polite" data-test="value">
      {{ shown ? (shown / 2).toFixed(1) : '–' }}
    </span>
  </div>
</template>
