import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { fetchUserProfile } from '@/views/user-profile/service/userProfileService'

export function userProfile() {
    const authStore = useAuthStore();

    const userData = ref({
        first_name: '',
        last_name: '',
        role: '',
        email: '',
        phone: '',
        address: '',
        description: '',
    });

    const authNameParts = computed(() => {
        const fullName = authStore.user?.name || '';
        if (!fullName.trim()) return { first: '', last: '' };

        const [first, ...rest] = fullName.trim().split(/\s+/);
        return { first: first || '', last: rest.join(' ') || '' };
    });

    const displayFirstName = computed(() => userData.value.first_name || authNameParts.value.first);
    const displayLastName = computed(() => userData.value.last_name || authNameParts.value.last);
    const displayRole = computed(() => userData.value.role || authStore.user?.role || '-');
    const displayEmail = computed(() => userData.value.email || authStore.user?.email || '-');



    onMounted(async () => {
        await authStore.initialize?.();
        const profile = await fetchUserProfile();
        if (profile) {
            userData.value = { ...userData.value, ...profile };
        }
    });

    return {
        authStore,
        userData,
        authNameParts,
        displayFirstName,
        displayLastName,
        displayRole,
        displayEmail
        
    }

}

