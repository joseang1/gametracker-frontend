<script setup>
import { reactive } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFormSubmit } from '@/composables/useFormSubmit'
import { validateLogin } from '@/core/validators/auth-validators'
import { safeRedirect } from '@/router/safe-redirect'
import AuthCard from '@/components/auth/AuthCard.vue'
import FormField from '@/components/ui/FormField.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({ username: '', password: '' })

const { submit, isSubmitting, error, fieldErrors } = useFormSubmit(
  () => auth.login(form.username.trim(), form.password),
  () => validateLogin(form),
)

async function onSubmit() {
  if (await submit()) router.push(safeRedirect(route.query.redirect))
}
</script>

<template>
  <AuthCard title="Welcome back" subtitle="Log in to keep tracking your games." :error="error">
    <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
      <FormField v-model="form.username" label="Username" autocomplete="username" :error="fieldErrors.username" />
      <FormField
        v-model="form.password"
        label="Password"
        type="password"
        autocomplete="current-password"
        :error="fieldErrors.password"
      />

      <button type="submit" class="btn-primary mt-2 w-full py-2.5" :disabled="isSubmitting">
        {{ isSubmitting ? 'Logging in…' : 'Log in' }}
      </button>
    </form>

    <template #footer>
      New here?
      <RouterLink :to="{ path: '/register', query: route.query }" class="font-semibold text-accent hover:underline">
        Create an account
      </RouterLink>
    </template>
  </AuthCard>
</template>
