import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from './useAuth.js';
import { hasAgreedToDataPrivacy } from '@/utility/redkik/dataPrivacy.js';

export function useLoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  // Form state
  const formValid = ref(false);
  const loading = ref(false);
  const showPassword = ref(false);
  const loginError = ref('');
  const isSubmitting = ref(false);

  // Form data
  const formData = reactive({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Form errors
  const errors = reactive({
    email: '',
    password: '',
  });
//validate email
  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      return 'Email must be valid';
    }
    return true;
  };

 //validate password
  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Za-z]/.test(password)) {
      return 'Password must contain at least one letter';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    return true;
  };

 //validate the entire form
  const validateForm = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    errors.email = emailError === true ? '' : emailError || '';
    errors.password = passwordError === true ? '' : passwordError || '';

    formValid.value = !errors.email && !errors.password;
    return formValid.value;
  };

  const validateEmailField =()=>{
    const emailError = validateEmail(formData.email);
    errors.email = emailError === true ? '' : emailError || '';
    return emailError === true;
  }

  const validatePasswordField =()=>{
    const passwordError = validatePassword(formData.password);
    errors.password = passwordError === true ? '' : passwordError || '';
    return passwordError === true;
  }

  //clear all errors
  const clearErrors = () => {
    loginError.value = '';
    errors.email = '';
    errors.password = '';
  };

  //handle form submission
  const handleSubmit = async () => {
    // Prevent double submission
    if (isSubmitting.value || loading.value) {
      return { success: false };
    }

    // Validate form
    if (!validateForm()) {
      return { success: false };
    }

    loading.value = true;
    isSubmitting.value = true;
    loginError.value = '';

    try {
      const result = await login(
        formData.email.trim(),
        formData.password,
      );

      if (result?.success) {
        if (!hasAgreedToDataPrivacy()) {
          return { success: true, needsPrivacyModal: true };
        }
        await router.push({ name: 'dashboard' });
        return { success: true, needsPrivacyModal: false };
      }

      const errorMessage = getErrorMessage(result?.error);
      loginError.value = errorMessage;
      return { success: false };
    } catch {
      loginError.value =
        'An error occurred during login. Please try again.';
      return { success: false };
    } finally {
      loading.value = false;
      setTimeout(() => {
        isSubmitting.value = false;
      }, 500);
    }
  };

  //get user-friendly error message from API error
  const getErrorMessage = (error) => {
    if (!error) {
      return 'Login failed. Please check your credentials.';
    }

    // Map common error messages to user-friendly ones
    const errorMessage = error.error_description || error.message || error.error || '';

    // Generic messages for security
    if (errorMessage.toLowerCase().includes('invalid') || 
        errorMessage.toLowerCase().includes('credentials') ||
        errorMessage.toLowerCase().includes('unauthorized')) {
      return 'Invalid email or password.';
    }

    if (errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('timeout') ||
        errorMessage.toLowerCase().includes('connection')) {
      return 'Network error. Please check your connection and try again.';
    }

    if (errorMessage.toLowerCase().includes('bad request') ||
        errorMessage.toLowerCase().includes('400')) {
      return 'Invalid request. Please check your credentials and try again.';
    }

    // Return generic message for other errors
    return 'Login failed. Please check your credentials.';
  };

  //toggle password visibility
  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
  };

  return {
    // State
    formData,
    formValid,
    loading,
    showPassword,
    loginError,
    errors,
    isSubmitting,

    // Methods
    handleSubmit,
    validateForm,
    validateEmailField,
    validatePasswordField,
    validateEmail,
    validatePassword,
    clearErrors,
    togglePasswordVisibility,
  };
}