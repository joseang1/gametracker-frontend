<script setup>
import { onUnmounted, ref } from 'vue'

defineProps({
  label: { type: String, required: true },
  confirmLabel: { type: String, required: true },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm'])

const armed = ref(false)
let timer

function disarm() {
  clearTimeout(timer)
  armed.value = false
}

function onClick() {
  if (armed.value) {
    disarm()
    emit('confirm')
    return
  }
  armed.value = true
  timer = setTimeout(disarm, 4000)
}

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <button
    type="button"
    class="btn px-3 py-1.5 text-xs"
    :class="armed ? 'bg-danger text-white hover:bg-red-500' : 'border border-line bg-surface text-muted hover:border-danger/50 hover:text-red-300'"
    :disabled="disabled"
    @click="onClick"
    @blur="disarm"
  >
    {{ armed ? confirmLabel : label }}
  </button>
</template>
