<script setup>
import { computed, inject, reactive } from 'vue'
import { useFormSubmit } from '@/composables/useFormSubmit'
import ProfileModel from '@/core/models/ProfileModel'
import UserAvatar from '@/components/ui/UserAvatar.vue'
import FormField from '@/components/ui/FormField.vue'

const MAX_BIO_LENGTH = 300
const URL_PATTERN = /^https?:\/\/.+/

const props = defineProps({
  profile: { type: ProfileModel, required: true },
})

const emit = defineEmits(['saved', 'cancel'])

const userService = inject('UserService')

const form = reactive({ bio: props.profile.bio, avatarUrl: props.profile.avatarUrl ?? '' })

const remaining = computed(() => MAX_BIO_LENGTH - form.bio.length)
const previewUrl = computed(() => (URL_PATTERN.test(form.avatarUrl.trim()) ? form.avatarUrl.trim() : null))

function validate() {
  const errors = {}
  if (form.bio.length > MAX_BIO_LENGTH) errors.bio = `Bio cannot be longer than ${MAX_BIO_LENGTH} characters`
  if (form.avatarUrl.trim() && !URL_PATTERN.test(form.avatarUrl.trim()))
    errors.avatarUrl = 'Avatar must be a valid http(s) URL'
  return errors
}

const { submit, isSubmitting, error, fieldErrors } = useFormSubmit(async () => {
  emit('saved', await userService.updateMyProfile(form))
}, validate)
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit.prevent="submit">
    <p
      v-if="error"
      class="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-red-300"
      role="alert"
      data-test="form-error"
    >
      {{ error }}
    </p>

    <div class="flex items-center gap-4">
      <UserAvatar :username="profile.username" :avatar-url="previewUrl" size="lg" data-test="preview" />
      <FormField
        v-model="form.avatarUrl"
        class="flex-1"
        label="Avatar image URL"
        type="url"
        hint="Paste a link to an image, starting with https://"
        :error="fieldErrors.avatarUrl"
      />
    </div>

    <label class="flex flex-col gap-1.5 text-sm font-semibold text-ink">
      Bio
      <textarea
        v-model="form.bio"
        rows="4"
        placeholder="What do you like to play?"
        class="resize-y rounded-lg border bg-surface px-3 py-2.5 font-normal text-ink placeholder:text-faint focus:ring-2 focus:outline-none"
        :class="fieldErrors.bio ? 'border-danger/70 focus:ring-danger/25' : 'border-line focus:border-accent focus:ring-accent/20'"
        data-test="bio"
      />
    </label>
    <div class="-mt-3 flex justify-between text-sm">
      <span v-if="fieldErrors.bio" class="text-danger" role="alert">{{ fieldErrors.bio }}</span>
      <span class="ml-auto" :class="remaining < 0 ? 'text-danger' : 'text-faint'" data-test="remaining">{{ remaining }}</span>
    </div>

    <footer class="flex justify-end gap-2 border-t border-line pt-5">
      <button type="button" class="btn-secondary" @click="emit('cancel')">Cancel</button>
      <button type="submit" class="btn-primary" :disabled="isSubmitting" data-test="save">
        {{ isSubmitting ? 'Saving…' : 'Save profile' }}
      </button>
    </footer>
  </form>
</template>
