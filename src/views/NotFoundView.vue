<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-32 text-center">
    <p class="font-display text-7xl font-extrabold text-accent">404</p>
    <h1 class="text-2xl font-bold">Game over: this page doesn't exist</h1>
    <p>The link may be broken, or the page may have been removed.</p>
    <RouterLink to="/" class="btn-primary mt-2">Back to home</RouterLink>
  </section>
</template>
