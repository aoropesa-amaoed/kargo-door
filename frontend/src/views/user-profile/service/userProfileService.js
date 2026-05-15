import api from '@/services/api';
import { useLoadingStore } from '@/stores/loading';

export const fetchUserProfile = async () => {
    const loadingStore = useLoadingStore();
    loadingStore.start('Loading profile…');
    try {
        const response = await api.get('/user-profiles/me');
        return response.data?.data ?? null;
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        return null;
    } finally {
        loadingStore.stop();
    }
};
