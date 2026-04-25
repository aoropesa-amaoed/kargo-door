import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/redkik/authStore'
import { useUserStore } from '@/stores/userStore'

export function useAuth() {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const { user: authUser, token: authToken } = storeToRefs(authStore)
  const { user: legacyUser, token: legacyToken } = storeToRefs(userStore)
  const router = useRouter()

  const isLoading = ref(false)
  const error = ref(null)

  const user = computed(() => authUser.value || legacyUser.value)
  const token = computed(() => authToken.value || legacyToken.value)

  const isAuthenticated = computed(
    () => authStore.isLoggedIn() || userStore.isAuthenticated()
  )

  const login = async (email, password) => {
    isLoading.value = true
    error.value = null
    try {
      const result = await authStore.login({ email, password })
      if (!result?.success) {
        error.value =
          result?.error?.error_description ||
          result?.error?.message ||
          'Login failed.'
        return result
      }
      userStore.syncAuthTokenFromStorage()
      return result
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (redirectTo = { name: 'login' }) => {
    await authStore.logout()
    await userStore.logout()
    router.push(redirectTo)
  }

  const requireAuth = () => {
    if (!authStore.isLoggedIn() && !userStore.isAuthenticated()) {
      router.replace({ name: 'login' })
      return false
    }
    return true
  }

  const requireGuest = () => {
    if (authStore.isLoggedIn() || userStore.isAuthenticated()) {
      router.replace({ name: 'dashboard' })
      return false
    }
    return true
  }

  return {
    authStore,
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    requireAuth,
    requireGuest,
  }
}
