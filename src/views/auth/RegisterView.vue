<script setup>
import { reactive } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFormSubmit } from '@/composables/useFormSubmit'
import { validateRegister } from '@/core/validators/auth-validators'
import { safeRedirect } from '@/router/safe-redirect'
import ApiError from '@/core/http/ApiError'
import AuthCard from '@/components/auth/AuthCard.vue'
import FormField from '@/components/ui/FormField.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({ username: '', email: '', password: '', confirmPassword: '' })

async function createAccount() {
  try {
    await auth.register(form.username.trim(), form.email.trim(), form.password)
  } catch (exception) {
    if (exception.status === 409) {
      const field = exception.message.startsWith('Email') ? 'email' : 'username'
      throw new ApiError(409, exception.message, { [field]: exception.message })
    }
    throw exception
  }
}

const { submit, isSubmitting, error, fieldErrors } = useFormSubmit(createAccount, () =>
  validateRegister({ ...form, username: form.username.trim(), email: form.email.trim() }),
)

async function onSubmit() {
  if (await submit()) router.push(safeRedirect(route.query.redirect))
}
</script>

<template>
  <AuthCard title="Create your account" subtitle="Start logging, rating and reviewing your games." :error="error">
    <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
      <FormField
        v-model="form.username"
        label="Username"
        autocomplete="username"
        hint="3–30 characters: letters, numbers and _"
        :error="fieldErrors.username"
      />
      <FormField v-model="form.email" label="Email" type="email" autocomplete="email" :error="fieldErrors.email" />
      <FormField
        v-model="form.password"
        label="Password"
        type="password"
        autocomplete="new-password"
        hint="At least 8 characters"
        :error="fieldErrors.password"
      />
      <FormField
        v-model="form.confirmPassword"
        label="Confirm password"
        type="password"
        autocomplete="new-password"
        :error="fieldErrors.confirmPassword"
      />

      <button type="submit" class="btn-primary mt-2 w-full py-2.5" :disabled="isSubmitting">
        {{ isSubmitting ? 'Creating account…' : 'Create account' }}
      </button>
    </form>

    <template #footer>
      Already have an account?
      <RouterLink :to="{ name: 'login', query: route.query }" class="font-semibold text-accent hover:underline">
        Log in
      </RouterLink>
    </template>
  </AuthCard>
</template>
