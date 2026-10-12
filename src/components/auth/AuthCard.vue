<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  error: { type: String, default: '' },
})
</script>

<template>
  <section class="relative isolate flex justify-center px-4 py-16 sm:py-24">
    <div
      class="absolute top-10 left-1/2 -z-10 size-96 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      aria-hidden="true"
    />

    <div class="w-full max-w-md rounded-card border border-line bg-surface/90 p-6 shadow-2xl shadow-black/50 sm:p-8">
      <header class="mb-6 text-center">
        <span class="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-accent/15 text-accent">
          <AppIcon name="gamepad" :size="26" />
        </span>
        <h1 class="text-2xl font-bold">{{ title }}</h1>
        <p v-if="subtitle" class="mt-1 text-sm">{{ subtitle }}</p>
      </header>

      <p
        v-if="error"
        class="mb-5 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-red-300"
        role="alert"
        data-test="form-error"
      >
        <AppIcon name="alert" :size="18" class="mt-px shrink-0" />
        {{ error }}
      </p>

      <slot />

      <footer v-if="$slots.footer" class="mt-6 border-t border-line pt-5 text-center text-sm">
        <slot name="footer" />
      </footer>
    </div>
  </section>
</template>
