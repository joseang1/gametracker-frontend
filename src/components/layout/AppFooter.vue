<script setup>
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-line-subtle">
    <div
      class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
    >
      <RouterLink to="/" class="flex items-center gap-2 font-display font-bold text-ink">
        <AppIcon name="gamepad" :size="18" class="text-accent" />
        GameTracker
      </RouterLink>

      <!-- RAWG asks every app using its API to credit it with a link -->
      <p class="text-faint">
        Game data provided by
        <a href="https://rawg.io" target="_blank" rel="noopener" class="font-medium text-muted underline-offset-4 hover:text-ink hover:underline">
          RAWG
        </a>
        · © {{ year }} GameTracker
      </p>
    </div>
  </footer>
</template>
