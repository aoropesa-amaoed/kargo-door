<template>
    <div class="page-loader" :class="{ 'page-loader--fullscreen': fullscreen }">
      <v-container fluid class="fill-height pa-0">
        <v-row align="center" justify="center" class="fill-height">
          <v-col cols="12" class="text-center">
            <!-- Skeleton Loader for better UX -->
            <template v-if="skeleton">
              <div class="loader-content">
                <div v-if="message" class="text-h6 text-medium-emphasis mb-2">
                  {{ message }}
                </div>
                <div v-if="submessage" class="text-caption text-medium-emphasis mb-4">
                  {{ submessage }}
                </div>
              </div>
              <v-card class="mx-auto" :max-width="skeletonWidth" elevation="0">
                <v-skeleton-loader
                  :type="skeletonType"
                  :loading="true"
                  class="mx-auto"
                />
              </v-card>
            </template>
            
            <!-- Standard Progress Indicator -->
            <template v-else>
              <div class="loader-content">
                <v-progress-circular
                  :size="size"
                  :width="width"
                  :color="color"
                  indeterminate
                  class="mb-4"
                />
                
                <div v-if="message" class="text-h6 text-medium-emphasis mb-2">
                  {{ message }}
                </div>
                
                <div v-if="submessage" class="text-caption text-medium-emphasis">
                  {{ submessage }}
                </div>
                
                <!-- Progress bar for determinate loading -->
                <div v-if="showProgress && progress !== null" class="mt-4">
                  <v-progress-linear
                    :model-value="progress"
                    :color="color"
                    height="6"
                    rounded
                    class="mx-auto"
                    style="max-width: 300px;"
                  />
                  <div class="text-caption mt-2">
                    {{ Math.round(progress) }}%
                  </div>
                </div>
              </div>
            </template>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    // Loading message
    message: {
      type: String,
      default: 'Loading data...',
    },
    
    // Optional submessage
    submessage: {
      type: String,
      default: 'Please wait',
    },
    
    // Use skeleton loader instead
    skeleton: {
      type: Boolean,
      default: false,
    },
    
    // Skeleton type (table, article, card, etc.)
    skeletonType: {
      type: String,
      default: 'table',
    },
    
    // Skeleton width
    skeletonWidth: {
      type: [String, Number],
      default: '100%',
    },
    
    // Fullscreen mode
    fullscreen: {
      type: Boolean,
      default: false,
    },
    
    // Spinner size
    size: {
      type: [String, Number],
      default: 64,
    },
    
    // Spinner width
    width: {
      type: [String, Number],
      default: 6,
    },
    
    // Spinner color
    color: {
      type: String,
      default: 'primary',
    },
    
    // Show progress bar
    showProgress: {
      type: Boolean,
      default: false,
    },
    
    // Progress value (0-100)
    progress: {
      type: Number,
      default: null,
    },
  });
  </script>
  
  <style scoped lang="scss">
  .page-loader {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &--fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      min-height: 100vh;
      background-color: rgba(255, 255, 255, 0.95);
      z-index: 9998;
    }
  }
  
  .loader-content {
    animation: fadeIn 0.3s ease-in;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  </style>
  