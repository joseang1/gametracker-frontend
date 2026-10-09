<script setup>
import { computed } from 'vue'

const props = defineProps({
  username: { type: String, required: true },
  avatarUrl: { type: String, default: null },
  size: { type: String, default: 'md', validator: (value) => ['sm', 'md', 'lg'].includes(value) },
})

const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-20 text-2xl' }

const palettes = ['bg-accent/15 text-accent', 'bg-info/15 text-info', 'bg-star/15 text-star']

const initials = computed(() => props.username.slice(0, 2).toUpperCase())

const palette = computed(() => {
  const hash = [...props.username].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return palettes[hash % palettes.length]
})
</script>

<template>
  <img
    v-if="avatarUrl"
    :src="avatarUrl"
    :alt="`${username}'s avatar`"
    class="shrink-0 rounded-full object-cover ring-1 ring-line"
    :class="sizes[size]"
  />
  <span
    v-else
    class="inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold ring-1 ring-line"
    :class="[sizes[size], palette]"
    :aria-label="`${username}'s avatar`"
    role="img"
  >
    {{ initials }}
  </span>
</template>
