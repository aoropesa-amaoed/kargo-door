import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/services/api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('auth_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const isLoading = ref(false)
  const error = ref(null)

  const login = async (email, password) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body: { email, password }
      })

      token.value = data.token
      user.value = data.user

      // Store in localStorage
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  const getCurrentUser = async () => {
    if (!token.value) return null

    try {
      const data = await apiFetch('/auth/me', {
        token: token.value
      })

      user.value = data.user
      return data.user
    } catch (err) {
      console.error(err)
      // Clear token if invalid
      token.value = null
      localStorage.removeItem('auth_token')
      throw err
    }
  }

  const isAuthenticated = () => !!token.value

  return {
    token,
    user,
    isLoading,
    error,
    login,
    logout,
    getCurrentUser,
    isAuthenticated
  }
})