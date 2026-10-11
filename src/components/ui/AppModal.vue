<script setup>
import { nextTick, onUnmounted, ref, useId, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  size: { type: String, default: 'md', validator: (value) => ['sm', 'md', 'lg'].includes(value) },
})

const emit = defineEmits(['close'])

const titleId = useId()
const panel = ref(null)
const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-2xl' }
let previousFocus = null

const onKeydown = (event) => {
  if (event.key === 'Escape') emit('close')
}

function lockPage() {
  previousFocus = document.activeElement
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', onKeydown)
}

function unlockPage() {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown)
  previousFocus?.focus?.()
  previousFocus = null
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      lockPage()
      await nextTick()
      panel.value?.focus()
    } else if (previousFocus !== null) {
      unlockPage()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (props.open) unlockPage()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div class="absolute inset-0 bg-canvas/80 backdrop-blur-md" data-test="backdrop" @click="emit('close')" />

      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        class="relative flex max-h-[92vh] w-full flex-col rounded-t-hero border border-slate-600/60 bg-[#1e2638] shadow-[0_20px_40px_-8px_rgb(0_0_0/0.8)] focus:outline-none sm:rounded-hero"
        :class="widths[size]"
      >
        <header class="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <h2 :id="titleId" class="text-lg font-bold">{{ title }}</h2>
          <button
            type="button"
            class="rounded-md p-1.5 text-muted transition hover:bg-raised hover:text-ink"
            aria-label="Close"
            data-test="close"
            @click="emit('close')"
          >
            <AppIcon name="close" :size="20" />
          </button>
        </header>

        <div class="overflow-y-auto px-5 py-5 sm:px-6">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
