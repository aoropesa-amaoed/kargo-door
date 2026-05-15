import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import api from '@/services/api';
import router from '@/router';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY)?? "");
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY)?? null));
  const isLoading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => Boolean(token.value));
  const isAdmin = computed(() => user.value?.role === 'admin');
  
 async function login(payload) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post('/login', payload);
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem(TOKEN_KEY, token.value);
      localStorage.setItem(USER_KEY, JSON.stringify(user.value));
    } catch (error) {
      error.value = error.message;
      throw error;
    }
    finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    error.value = null;
    try {
      await api.post('/logout');
     
    } catch (error) {
    console.error('Logout API error:', error);
    error.value = error.response?.data?.message || error.message;
    }
    finally {
      token.value = "";
      user.value = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      isLoading.value = false;

      router.push('/login');
    }
  }

  function clearSession() {
    token.value = "";
    user.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function syncAuthTokenFromStorage() {
    token.value = localStorage.getItem(TOKEN_KEY) ?? "";
    user.value = JSON.parse(localStorage.getItem(USER_KEY) ?? null);
  }

  async function initialize() {
    syncAuthTokenFromStorage();
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    login,
    logout,
    clearSession,
    syncAuthTokenFromStorage,
    initialize,
  }


});
