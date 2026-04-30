import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';

export const useAuth = () => {
    const authStore = useAuthStore();
    const { token, user, isAuthenticated, isAdmin } = storeToRefs(authStore);

    return {
        authStore,
        login: authStore.login,
        logout: authStore.logout,
        token,
        user,
        isAuthenticated,
        isAdmin,
    }
}