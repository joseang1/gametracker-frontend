<script setup>
const title = import.meta.env.VITE_APP_TITLE
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-4 px-4 text-center">
    <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">{{ title }}</h1>
    <p class="max-w-md">Log, rate and review the games you play.</p>
    <span class="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
      Coming soon
    </span>
  </main>
</template>
