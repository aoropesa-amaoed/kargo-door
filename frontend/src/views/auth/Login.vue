<template>
   <div class="login-container">
      <DataPrivacy
         v-model="isDataPrivacyModalOpen"
         @agree="handleDataPrivacyAgree"
         @cancel="handleDataPrivacyCancel"
      />
      <v-row align="start" justify="center" class="fill-height no-gutters-row login-content-row">
         <!-- left panel -->
         <v-col cols="12" md="6" class="d-flex align-center justify-center justify-md-start pa-0">
            <div class="d-flex align-center justify-start">
               <div>
                  <img
                     :src="MaagapLogoWhite"
                     alt="Maagap Logo"
                     class="maagap-logo"
                  />
               </div>
               <div class="divider-line mx-2 mx-md-4"></div>
                  <div class="marine-cargo-title">
                     <h2 class="marine-cargo-title-text mb-0">
                     MARINE CARGO<br />INSURANCE
                     </h2>
                 </div>
            </div>
         </v-col>
         <!-- right panel -->
         <v-col cols="12" md="6" class="d-flex align-center align-md-start justify-center justify-md-end pa-0">
            <div class="login-section d-flex flex-column align-center pa-4 pa-md-6 ma-4 ma-md-6" >
                  <div class="login-header d-flex flex-column align-center mb-6">
                     <h2 class="pa-0 ma-0">WELCOME TO</h2>
                        <v-img
                        :src="KargoDoorLogo"
                        alt="KargoDoor Logo"
                        class="form-logo mb-0 pa-0"
                        />
                  </div>
                  <div class="login-form d-flex flex-column align-center justify-center">
                     <!-- Native form: VForm + error-messages + required can recurse in Vuetify 4 -->
                     <v-form class="w-100" @submit.prevent="handleLogin" novalidate>
                        <v-alert
                           v-if="loginError"
                           type="error"
                           variant="tonal"
                           class="mb-4"
                           density="compact"
                        >
                           {{ loginError }}
                        </v-alert>
                        <v-text-field
                           v-model="formData.email"
                           label="Email *"
                           type="email"
                           autocomplete="username"
                           variant="outlined"
                           hide-details="auto"
                           :error-messages="emailErrors"
                           class="mb-2"
                           @blur="validateEmailField"
                        />
                        <v-text-field
                           v-model="formData.password"
                           label="Password *"
                           :type="showPassword ? 'text' : 'password'"
                           autocomplete="current-password"
                           :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                           @click:append-inner="togglePasswordVisibility"
                           variant="outlined"
                           hide-details="auto"
                           :error-messages="passwordErrors"
                           class="mb-2"
                           @blur="validatePasswordField"
                        />
                        <div class="d-flex justify-end align-center mb-4">
                           <v-btn
                              variant="text"
                              class="text-caption text-medium-emphasis px-0"
                           >
                              Forgot Password?
                           </v-btn>
                        </div>
                        <v-btn
                           block
                           size="large"
                           type="submit"
                           class="mt-2"
                           aria-label="Log in to your account"
                           color="primary"
                           :loading="loading"
                           :disabled="loading"
                        >
                           Log in
                        </v-btn>
                     </v-form>

                  </div>
            </div>
         </v-col>
      </v-row>
      <!-- footer -->
      <v-row>
         <v-col cols="12">
            <div class="footer pa-0 ma-0">
            <img
               :src="KargoTagLine"
               alt="Kargo Tagline"
               class="kargo-tagline"

            />
         </div>
         </v-col>
      </v-row>

   </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import MaagapLogoWhite from '@/assets/image/maagap-logo-white.png'
import KargoDoorLogo from '@/assets/image/kargo-door-logo.png'
import KargoTagLine from '@/assets/image/kargo-tagline.png'
import { useAuth } from '@/composables/useAuth'
import { useLoginForm } from '@/composables/useLoginForm'
import DataPrivacy from '@/components/modals/DataPrivacy.vue'

const router = useRouter()
const { authStore, logout } = useAuth()

const { formData, loading, loginError, errors, handleSubmit, showPassword, togglePasswordVisibility, validateEmailField, validatePasswordField } = useLoginForm()

const emailErrors = computed(() => (errors.email ? [errors.email] : []))
const passwordErrors = computed(() => (errors.password ? [errors.password] : []))

const isDataPrivacyModalOpen = ref(false)

const handleLogin = async () => {
  const result = await handleSubmit()
  if (result?.success && result.needsPrivacyModal) {
    authStore.syncAuthTokenFromStorage()
    isDataPrivacyModalOpen.value = true
  }
}

const handleDataPrivacyAgree = async () => {
  authStore.syncAuthTokenFromStorage()
  await router.push({ name: 'dashboard' })
}

const handleDataPrivacyCancel = async () => {
  await logout()
}
</script>
<style scoped lang="scss">
@use '@/assets/styles/Login.scss' as login;
</style>
