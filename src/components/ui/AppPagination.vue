<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})

const emit = defineEmits(['change'])
</script>

<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-3" aria-label="Pagination">
    <button
      type="button"
      class="btn-secondary"
      :disabled="page === 0"
      data-test="previous"
      @click="emit('change', page - 1)"
    >
      <AppIcon name="chevron-left" :size="16" />
      <span class="hidden sm:inline">Previous</span>
    </button>

    <p class="min-w-28 text-center text-sm" aria-live="polite">
      Page <span class="font-semibold text-ink">{{ page + 1 }}</span> of {{ totalPages }}
    </p>

    <button
      type="button"
      class="btn-secondary"
      :disabled="page >= totalPages - 1"
      data-test="next"
      @click="emit('change', page + 1)"
    >
      <span class="hidden sm:inline">Next</span>
      <AppIcon name="chevron-right" :size="16" />
    </button>
  </nav>
</template>
