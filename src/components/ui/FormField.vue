<script setup>
import { computed, ref, useId } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const model = defineModel({ type: String, default: '' })

const props = defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
})

const id = useId()
const showPassword = ref(false)

const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => (isPassword.value && showPassword.value ? 'text' : props.type))
const describedBy = computed(() => (props.error ? `${id}-error` : props.hint ? `${id}-hint` : undefined))
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-sm font-semibold text-ink">{{ label }}</label>

    <div class="relative">
      <input
        :id="id"
        v-model="model"
        :type="inputType"
        :autocomplete="autocomplete"
        :aria-invalid="Boolean(error)"
        :aria-describedby="describedBy"
        class="w-full rounded-lg border bg-surface px-3 py-2.5 text-ink transition placeholder:text-faint focus:ring-2 focus:outline-none"
        :class="[
          error ? 'border-danger/70 focus:ring-danger/25' : 'border-line focus:border-accent focus:ring-accent/20',
          { 'pr-11': isPassword },
        ]"
      />
      <button
        v-if="isPassword"
        type="button"
        class="absolute inset-y-0 right-0 grid w-11 place-items-center text-faint transition hover:text-ink"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        data-test="toggle-password"
        @click="showPassword = !showPassword"
      >
        <AppIcon :name="showPassword ? 'eye-off' : 'eye'" :size="18" />
      </button>
    </div>

    <p v-if="error" :id="`${id}-error`" class="text-sm text-danger" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="text-xs text-faint">{{ hint }}</p>
  </div>
</template>
