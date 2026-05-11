<template>
    <v-container  class="mt-2 pa-2" fluid> 
         <!--progress steps  -->
         <ProgressSteps 
         :steps="steps"
         :current-step="currentStep"
         :can-access-step3="canAccessStep3"
         @update:current-step="updateCurrentStep"
         />
         <!--title and action buttons -->
        <TitleandButtons 
         :current-step="currentStep"
         :steps-length="steps.length"
         :loading="loading"
         @next="handleNext"
         @back="handleBack"
         @save="handleSave"
         @purchase-on-invoice="handlePurchaseOnInvoice"
        />
        <!-- Shipment Details -->
         <!-- step 1 -->
         <ShipmentForm 
          v-if="currentStep === 1" 
          
         />
         <!-- step 2 -->
         <ClientDetails 
          v-if="currentStep === 2"
          
         />
         <!-- step 3 -->
        <!-- Shipment Summary -->
        <ShipmentSummary 
         v-if="currentStep === 3"
        />
     
   </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
//components
import TitleandButtons from '../components/TitleandButtons.vue';
import ProgressSteps from '../components/ProgressSteps.vue';
import ShipmentForm from '../components/ShipmentForm.vue';
import ClientDetails from '../components/ClientDetails.vue';
import ShipmentSummary from '../components/Summary.vue';

//composables
import {useProgressSteps} from '../composables/progressSteps';
//store
import { useShipmentsForm } from '../store/shipmentFormStore.js';

const router = useRouter();
const formStore = useShipmentsForm();

const { currentStep, steps, gotoNextStep, gotoPreviousStep, gotoStep, isFirstStep, isLastStep, resetSteps } = useProgressSteps();

const loading = computed(() => formStore.loading);
const canAccessStep3 = ref(true);

onMounted(() => {
  formStore.fetchCommodityOptions();
  formStore.fetchCustomerOptions();
});

const updateCurrentStep = (step) => {
  gotoStep(step);
};

const handleNext = () => {
  gotoNextStep();
};

const handleBack = () => {
  gotoPreviousStep();
};

const handleSave = async () => {
  try {
    await formStore.createShipment();
    // Success - show message and navigate
    alert('Shipment created successfully!');
    formStore.resetAddForm();
    resetSteps();
    router.push('/shipments');
  } catch (error) {
    // Error is handled in the store
    alert(`Failed to create shipment: ${formStore.error || error.message}`);
    console.error('Save failed:', error);
  }
};

const handlePurchaseOnInvoice = () => {
  // Implement purchase on invoice logic
  console.log('Purchase on invoice');
};
</script>

<style lang="scss" scoped>

</style>