import { reactive, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';

export function useLoginForm() {
  const authStore = useAuthStore();

  const formData = reactive({
    email: '',
    password: '',
  });

  const loading = ref(false);
  const loginError = ref('');
  const showPassword = ref(false);

  const errors = reactive({
    email: '',
    password: '',
  });

  function validateEmailField() {
    const email = formData.email?.trim() ?? '';
    if (!email) {
      errors.email = 'Email is required.';
      return false;
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    errors.email = isValid ? '' : 'Please enter a valid email address.';
    return isValid;
  }

  function validatePasswordField() {
    const password = formData.password ?? '';
    if (!password) {
      errors.password = 'Password is required.';
      return false;
    }
    errors.password = '';
    return true;
  }

  function togglePasswordVisibility() {
    showPassword.value = !showPassword.value;
  }

  async function handleSubmit() {
    loginError.value = '';
    const isEmailValid = validateEmailField();
    const isPasswordValid = validatePasswordField();

    if (!isEmailValid || !isPasswordValid) {
      return { success: false, needsPrivacyModal: false };
    }

    loading.value = true;
    try {
      await authStore.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      return { success: true, needsPrivacyModal: true };
    } catch (err) {
      loginError.value = err?.response?.data?.message || err?.message || 'Login failed';
      return { success: false, needsPrivacyModal: false };
    } finally {
      loading.value = false;
    }
  }

  return {
    formData,
    loading,
    loginError,
    errors,
    handleSubmit,
    showPassword,
    togglePasswordVisibility,
    validateEmailField,
    validatePasswordField,
  };
}
