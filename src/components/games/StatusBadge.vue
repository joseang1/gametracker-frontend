<script setup>
import { computed } from 'vue'
import { LOG_STATUSES, isLogStatus } from '@/core/game-log/log-statuses'

const props = defineProps({
  status: { type: String, required: true, validator: isLogStatus },
})

const style = computed(() => LOG_STATUSES[props.status])
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase"
    :class="style.classes"
  >
    <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
    {{ style.label }}
  </span>
</template>
