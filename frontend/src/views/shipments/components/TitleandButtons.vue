<template>
    <div class="page-header mb-2">
      <h1 class="page-title">New Shipment</h1>
      <div class="d-flex ga-4">
        <v-btn
          v-if="showBackButton"
          text="Back"
          prepend-icon="mdi-arrow-left"
          color="secondary"
          variant="tonal"
          class="mb-2 mb-sm-0 branding-button"
          @click="$emit('back')"
        />      
        <template v-if="showLastStepButtons">
          <v-btn
            text="Save"
            class="mb-2 mb-sm-0 branding-button"
            color="primary"
            :loading="loading"
            :disabled="loading"
            @click="$emit('save')"
          />
          <v-btn
            text="Purchase on Invoice"  
            color="primary"       
            class="mb-2 mb-sm-0 branding-button"
            :disabled="loading"
            @click="$emit('purchaseOnInvoice')"
          />
        </template>
  
        <v-btn
          v-if="showNextButton"
          text="Next"
          append-icon="mdi-arrow-right"          
          color="primary"
          class="mb-2 mb-sm-0 branding-button"
          :loading="loading && currentStep === 2"
          :disabled="loading"
          @click="$emit('next')"
        /> 
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'; 
  
  const props = defineProps({
    currentStep: { type: Number, required: true },
    stepsLength: { type: Number, required: true },
    loading: { type: Boolean, default: false },
  });
  
  defineEmits(['back', 'next', 'save', 'purchaseOnInvoice']);
  
  const showBackButton = computed(() => props.currentStep > 1);
  const showNextButton = computed(() => props.currentStep < props.stepsLength);
  const showLastStepButtons = computed(() => props.currentStep === props.stepsLength);
  </script>
  
  <style scoped lang="scss"> 
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: primary;
      margin-bottom: 0.5rem;
    }
  }
  
  @media (max-width: 959px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 0;
      .page-title {
        display: none;
      }
    }
  }  
  :deep(.branding-button:hover:not(:disabled)) {
    background-color: primary !important;
  } 
  </style>
  