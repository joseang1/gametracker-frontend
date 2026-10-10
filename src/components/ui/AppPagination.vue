<script setup>
import { computed } from 'vue'
import { getPageItems, GAP_START, GAP_END } from '@/core/pagination/page-items'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})

const emit = defineEmits(['change'])

const items = computed(() => getPageItems(props.page, props.totalPages))
const isFirst = computed(() => props.page === 0)
const isLast = computed(() => props.page >= props.totalPages - 1)

const numberFormat = new Intl.NumberFormat('en-US')
const formatNumber = (value) => numberFormat.format(value)

const isGap = (item) => item === GAP_START || item === GAP_END

function go(target) {
  if (target !== props.page) emit('change', target)
}
</script>

<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-1.5" aria-label="Pagination">
    <button
      type="button"
      class="page-button sm:hidden"
      :disabled="isFirst"
      aria-label="First page"
      data-test="first"
      @click="go(0)"
    >
      <AppIcon name="chevrons-left" :size="16" />
    </button>

    <button
      type="button"
      class="page-button"
      :disabled="isFirst"
      aria-label="Previous page"
      data-test="previous"
      @click="go(page - 1)"
    >
      <AppIcon name="chevron-left" :size="16" />
    </button>

    <ol class="hidden items-center gap-1.5 sm:flex" data-test="pages">
      <li v-for="item in items" :key="item">
        <span v-if="isGap(item)" class="px-1 text-faint" aria-hidden="true">…</span>
        <button
          v-else
          type="button"
          class="page-button"
          :aria-current="item === page ? 'page' : undefined"
          :aria-label="`Page ${formatNumber(item + 1)}`"
          @click="go(item)"
        >
          {{ formatNumber(item + 1) }}
        </button>
      </li>
    </ol>

    <p class="px-2 text-sm whitespace-nowrap sm:hidden" aria-live="polite" data-test="summary">
      Page <span class="font-semibold text-ink">{{ formatNumber(page + 1) }}</span> of {{ formatNumber(totalPages) }}
    </p>

    <button
      type="button"
      class="page-button"
      :disabled="isLast"
      aria-label="Next page"
      data-test="next"
      @click="go(page + 1)"
    >
      <AppIcon name="chevron-right" :size="16" />
    </button>

    <button
      type="button"
      class="page-button sm:hidden"
      :disabled="isLast"
      aria-label="Last page"
      data-test="last"
      @click="go(totalPages - 1)"
    >
      <AppIcon name="chevrons-right" :size="16" />
    </button>
  </nav>
</template>
