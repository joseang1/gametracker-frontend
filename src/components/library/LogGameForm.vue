<script setup>
import { computed, inject, reactive, ref } from 'vue'
import { useFormSubmit } from '@/composables/useFormSubmit'
import { LOG_STATUSES } from '@/core/game-log/log-statuses'
import GameDetailModel from '@/core/models/GameDetailModel'
import StarRatingInput from '@/components/ui/StarRatingInput.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const MAX_REVIEW_LENGTH = 5000

const props = defineProps({
  game: { type: GameDetailModel, required: true },
  entry: { type: Object, required: true },
})

const emit = defineEmits(['change', 'cancel'])

const gameLogService = inject('GameLogService')
const reviewService = inject('ReviewService')

const form = reactive({
  status: props.entry.log?.status ?? null,
  platform: props.entry.log?.platform ?? '',
  hoursPlayed: props.entry.log?.hoursPlayed?.toString() ?? '',
  favorite: props.entry.log?.favorite ?? false,
  rating: props.entry.review?.rating ?? null,
  body: props.entry.review?.body ?? '',
  spoiler: props.entry.review?.spoiler ?? false,
})

const statuses = Object.entries(LOG_STATUSES).map(([value, style]) => ({ value, ...style }))
const remaining = computed(() => MAX_REVIEW_LENGTH - form.body.length)

function validate() {
  const errors = {}
  if (!form.status && !form.rating) errors.form = 'Choose a status or a rating to save.'
  if (form.body.trim() && !form.rating) errors.rating = 'Add a rating to post your review.'
  if (props.entry.review && !form.rating) errors.rating = 'A review needs a rating. Use "Delete review" to remove it.'
  if (form.body.length > MAX_REVIEW_LENGTH) errors.body = `Review cannot be longer than ${MAX_REVIEW_LENGTH} characters`
  if (form.hoursPlayed !== '' && !/^\d+$/.test(form.hoursPlayed.toString().trim()))
    errors.hoursPlayed = 'Use whole hours, for example 12'
  else if (Number(form.hoursPlayed) > 100000) errors.hoursPlayed = 'Hours played is too high'
  return errors
}

async function save() {
  const log = form.status ? await gameLogService.saveLog(props.game.id, form) : props.entry.log
  const review = form.rating ? await reviewService.saveReview(props.game.id, form) : props.entry.review
  emit('change', { log, review })
}

const { submit, isSubmitting, error, fieldErrors } = useFormSubmit(save, validate)

const confirming = ref(null)
const isDeleting = ref(false)
const deleteError = ref('')

async function remove(part) {
  if (confirming.value !== part) {
    confirming.value = part
    return
  }
  isDeleting.value = true
  deleteError.value = ''
  try {
    if (part === 'log') {
      await gameLogService.deleteLog(props.game.id)
      emit('change', { log: null, review: props.entry.review })
    } else {
      await reviewService.deleteReview(props.game.id)
      emit('change', { log: props.entry.log, review: null })
    }
  } catch (exception) {
    deleteError.value = exception.message
  } finally {
    isDeleting.value = false
    confirming.value = null
  }
}
</script>

<template>
  <form class="flex flex-col gap-7" novalidate @submit.prevent="submit">
    <p
      v-if="error || fieldErrors.form || deleteError"
      class="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-red-300"
      role="alert"
      data-test="form-error"
    >
      {{ error || fieldErrors.form || deleteError }}
    </p>

    <fieldset class="flex flex-col gap-4">
      <legend class="mb-3 text-xs font-bold tracking-wide text-faint uppercase">Your log</legend>

      <div role="radiogroup" aria-label="Status" class="flex flex-wrap gap-2" data-test="statuses">
        <button
          v-for="status in statuses"
          :key="status.value"
          type="button"
          role="radio"
          :aria-checked="form.status === status.value"
          class="rounded-lg border px-3 py-1.5 text-sm font-semibold transition"
          :class="form.status === status.value ? status.classes : 'border-line bg-surface text-muted hover:text-ink'"
          @click="form.status = status.value"
        >
          {{ status.label }}
        </button>
      </div>
      <p v-if="fieldErrors.status" class="text-sm text-danger">{{ fieldErrors.status }}</p>

      <div class="grid gap-4 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
        <label class="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          Platform
          <select
            v-if="game.platforms.length"
            v-model="form.platform"
            class="rounded-lg border border-line bg-surface px-3 py-2.5 font-normal text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
            data-test="platform"
          >
            <option value="">Not specified</option>
            <option v-for="platform in game.platforms" :key="platform" :value="platform">{{ platform }}</option>
          </select>
          <input
            v-else
            v-model="form.platform"
            maxlength="50"
            class="rounded-lg border border-line bg-surface px-3 py-2.5 font-normal text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
            data-test="platform"
          />
        </label>

        <label class="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          Hours
          <input
            v-model="form.hoursPlayed"
            inputmode="numeric"
            placeholder="0"
            class="rounded-lg border bg-surface px-3 py-2.5 font-normal text-ink focus:ring-2 focus:outline-none"
            :class="fieldErrors.hoursPlayed ? 'border-danger/70 focus:ring-danger/25' : 'border-line focus:border-accent focus:ring-accent/20'"
            :aria-invalid="Boolean(fieldErrors.hoursPlayed)"
            data-test="hours"
          />
        </label>

        <button
          type="button"
          class="flex h-[2.875rem] items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition"
          :class="form.favorite ? 'border-danger/40 bg-danger/10 text-red-400' : 'border-line bg-surface text-muted hover:text-ink'"
          :aria-pressed="form.favorite"
          data-test="favorite"
          @click="form.favorite = !form.favorite"
        >
          <AppIcon name="heart" :size="18" :filled="form.favorite" />
          Favourite
        </button>
      </div>
      <p v-if="fieldErrors.hoursPlayed" class="-mt-2 text-sm text-danger" role="alert">{{ fieldErrors.hoursPlayed }}</p>
    </fieldset>

    <fieldset class="flex flex-col gap-4 border-t border-line pt-6">
      <legend class="sr-only">Your review</legend>
      <p class="text-xs font-bold tracking-wide text-faint uppercase" aria-hidden="true">Your review</p>

      <StarRatingInput v-model="form.rating" />
      <p v-if="fieldErrors.rating" class="-mt-2 text-sm text-danger" role="alert" data-test="rating-error">
        {{ fieldErrors.rating }}
      </p>

      <label class="flex flex-col gap-1.5 text-sm font-semibold text-ink">
        <span class="flex justify-between">
          Review <span class="font-normal text-faint">optional</span>
        </span>
        <textarea
          v-model="form.body"
          rows="5"
          placeholder="What did you think?"
          class="resize-y rounded-lg border bg-surface px-3 py-2.5 font-normal text-ink placeholder:text-faint focus:ring-2 focus:outline-none"
          :class="fieldErrors.body ? 'border-danger/70 focus:ring-danger/25' : 'border-line focus:border-accent focus:ring-accent/20'"
          data-test="body"
        />
      </label>
      <div class="-mt-2 flex items-center justify-between gap-4 text-sm">
        <label class="flex items-center gap-2 text-muted">
          <input v-model="form.spoiler" type="checkbox" class="size-4 accent-emerald-500" data-test="spoiler" />
          Contains spoilers
        </label>
        <span :class="remaining < 0 ? 'text-danger' : 'text-faint'" data-test="remaining">{{ remaining }}</span>
      </div>
      <p v-if="fieldErrors.body" class="-mt-2 text-sm text-danger" role="alert">{{ fieldErrors.body }}</p>
    </fieldset>

    <footer class="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap gap-2">
        <button
          v-if="entry.log"
          type="button"
          class="btn-ghost text-red-400 hover:bg-danger/10 hover:text-red-300"
          :disabled="isDeleting"
          data-test="delete-log"
          @click="remove('log')"
        >
          <AppIcon name="trash" :size="16" />
          {{ confirming === 'log' ? 'Click again to remove' : 'Remove from library' }}
        </button>
        <button
          v-if="entry.review"
          type="button"
          class="btn-ghost text-red-400 hover:bg-danger/10 hover:text-red-300"
          :disabled="isDeleting"
          data-test="delete-review"
          @click="remove('review')"
        >
          <AppIcon name="trash" :size="16" />
          {{ confirming === 'review' ? 'Click again to delete' : 'Delete review' }}
        </button>
      </div>
      <div class="flex gap-2 sm:justify-end">
        <button type="button" class="btn-secondary flex-1 sm:flex-none" @click="emit('cancel')">Cancel</button>
        <button type="submit" class="btn-primary flex-1 sm:flex-none" :disabled="isSubmitting" data-test="save">
          {{ isSubmitting ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </footer>
  </form>
</template>
