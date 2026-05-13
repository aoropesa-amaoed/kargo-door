<template>
    <div v-if="props.steps && props.steps.length" class="progress-steps" :class="{ 'shake': isShaking }">
      <div class="steps-container">
        <div 
          v-for="(step, index) in props.steps" 
          :key="index"
          class="step-item"
          :class="{ 
            'active': props.currentStep === index + 1, 
            'completed': props.currentStep > index + 1,
            'disabled': index === 2 && !props.canAccessStep3
          }"
          @click="handleStepClick(index + 1)"
        >
          <div class="step-item-content">
            <div class="step-circle">
              <span v-if="props.currentStep > index + 1" class="step-check">✓</span>
              <span v-else class="step-number">{{ index + 1 }}</span>
            </div>
            <div class="step-title" v-html="formatStepTitle(step)"></div> 
          </div>        
        </div>
      </div>
      <div class="progress-segments">
        <div 
          v-for="(step, index) in props.steps.slice(0, -1)" 
          :key="index"
          class="progress-segment"
          :class="{ 'completed': props.currentStep > index + 1 }"
        >
          <div class="segment-line"></div>
          
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    steps: {
      type: Array,
      required: true,
    },
    currentStep: {
      type: Number,
      required: true,
    },
    canAccessStep3: {
      type: Boolean,
      default: true, 
    },
  });
  
  const emit = defineEmits(['update:currentStep']);
  
  const isShaking = ref(false);
  
  
  const formatStepTitle = (title) => {
    if (!title) return '';
  
    return title.replace(/&/g, '&<wbr>');
  };
  
  const handleStepClick = (stepNumber) => {
    if (stepNumber === 3 && !props.canAccessStep3) {
      shakeScreen();
      return;
    }
    
    emit('update:currentStep', stepNumber);
  };
  
  const shakeScreen = () => {
    isShaking.value = true;
    
    setTimeout(() => {
      isShaking.value = false;
    }, 500);
  };
  </script>
  
  <style scoped lang="scss">
  
  
  .progress-steps {
    position: relative;
    padding: 1rem 0;
  }
  
  .steps-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    z-index: 2;
    top: 0;
  }
  
  .step-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    flex: 1;
    max-width: 200px;
    gap: 0.5rem;
    
    &:hover {
      transform: translateY(-2px);
    }
    
    &.disabled {
      cursor: not-allowed;
      opacity: 0.6;
      
      &:hover {
        transform: none;
      }
    }
  }
  
  .step-item-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }
  
  .step-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e0e0e0;
    border: 2px solid #e0e0e0;
    transition: all 0.3s ease;
    flex-shrink: 0;
    position: relative;
    z-index: 2;
    
    .step-item.active & {
      background-color: #e0e0e0;
      border-color: #1976d2;
    }
    
    .step-item.completed & {
      background-color: #1976d2;
      border-color: #1976d2;
    }
  }
  
  .step-number {
    font-weight: 600;
    font-size: 0.9rem;
    color: #333;
    
    .step-item.active & {
      color: #333;
    }
  }
  
  .step-check {
    font-weight: 700;
    font-size: 1.2rem;
    color: #fff;
    line-height: 1;
  }
  
  .step-title {
    font-size: 0.75rem;
    font-weight: 500;
    color: #666;
    text-align: left;
    line-height: 1.2;
    flex: 1;
    
    .step-item.active & {
      color: #333;
      font-weight: 600;
    }
    
    .step-item.completed & {
      color: #333;
    }
  }
  
  .progress-segments {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 100px;
    right:35px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
    padding: 0 60px;
  }
  
  .progress-segment {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin: 0;
  }
  
  .segment-line {
    width: 100%;
    height: 3px;
    margin-left: 20%;
    margin-right: 10%;
    background-color: #e0e0e0;
    transition: background-color 0.3s ease;
    
    .progress-segment.completed & {
      background-color: #1976d2;
    }
  }
    @media (max-width: 600px) 
    {  
     .steps-container {
      display: flex;
      flex-direction: row;
      gap: 1rem;
    }     
    .progress-steps {
      display: flex;
      flex-direction: column;
      margin-left: 2rem;
     
      justify-content: space-between;
      gap: 2rem;
    }      
    .step-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      max-width: 100%;
      gap: 0.75rem;
    }
    
    .step-item-content {
      flex-direction: row;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
    }
    
    .step-circle {
      width: 42px;
      height: 42px;
    } 
      
    .step-title {
      font-size:18px;
      font-weight: 500;
      color: text-secondary;
      text-align: left;
      line-height: 1.2;
      display: none;
    }
    .progress-segments {
      display: none;
    }
    
    
  }
  
  @media (min-width: 960px) {
    .progress-steps {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      width: 100%;
     
    }
    
    .steps-container {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12rem;
      width: 100%;
      position: relative;
      transition: all 0.3s ease;
    }
    
    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 0 0 auto;    
      min-width: 0; 
      gap: 0.75rem;
    }
    
    .step-item-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      width: auto;
      min-width: 0; 
    }
    
    .step-circle {
      width: 32px;
      height: 32px;
    }
    
    .step-title {
      font-size: 0.75rem;
      font-weight: 500;
        color: text-secondary;
      text-align: right;
      line-height: 1.2;
      word-wrap: break-word;
      overflow-wrap: break-word;
      
      
      max-width: 100%;
      margin-top: 0.5rem;
      
    }
    
    .progress-segments {
    display: flex;
    position: absolute;
      top: 32px;
      transform: translateY(-50%);
    left: 0;
    right: 0;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
    padding-left: 16px;
    padding-right: 16px;
    pointer-events: none;
    gap: 0;
    transition: all 0.3s ease;
  }
  }
  
  
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }
  
  .progress-steps.shake {
    animation: shake 0.5s ease-in-out;
  }
  
  </style>
  