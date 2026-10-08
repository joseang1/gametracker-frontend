<script setup>
import { computed } from 'vue'

// Small stroke icons drawn on a 24x24 grid; color comes from the text color (currentColor)
const paths = {
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  'chevron-down': ['M6 9l6 6 6-6'],
  gamepad: [
    'M7 7h10a5 5 0 0 1 4.9 6l-.8 3.6A2.5 2.5 0 0 1 16.7 18L14.5 15h-5l-2.2 3a2.5 2.5 0 0 1-4.4-1.4L2.1 13A5 5 0 0 1 7 7z',
    'M8 10v3',
    'M6.5 11.5h3',
    'M15.5 11h.01',
    'M17.5 12.5h.01',
  ],
  user: ['M20 21a8 8 0 0 0-16 0', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  shield: ['M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z'],
  logout: ['M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3', 'M10 17l-5-5 5-5', 'M5 12h11'],
}

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
})

const lines = computed(() => paths[props.name] ?? [])
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="d in lines" :key="d" :d="d" />
  </svg>
</template>
