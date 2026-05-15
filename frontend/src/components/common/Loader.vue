<template>
  <Teleport to="body" :disabled="!fullscreen">
    <div
      v-if="visible"
      class="page-loader"
      :class="{ 'page-loader--fullscreen': fullscreen }"
    >
      <v-container fluid class="fill-height pa-0">
        <v-row align="center" justify="center" class="fill-height">
          <v-col cols="12" class="text-center">
            <template v-if="skeleton">
              <div class="loader-content">
                <div v-if="displayMessage" class="text-h6 text-medium-emphasis mb-2">
                  {{ displayMessage }}
                </div>
                <div v-if="submessage" class="text-caption text-medium-emphasis mb-4">
                  {{ submessage }}
                </div>
              </div>
              <v-card class="mx-auto" :max-width="skeletonWidth" elevation="0">
                <v-skeleton-loader :type="skeletonType" :loading="true" class="mx-auto" />
              </v-card>
            </template>

            <template v-else>
              <div class="loader-content">
                <v-progress-circular :size="size" :width="width" :color="color" indeterminate class="mb-4" />

                <div v-if="displayMessage" class="text-h6 text-medium-emphasis mb-2">
                  {{ displayMessage }}
                </div>

                <div v-if="submessage" class="text-caption text-medium-emphasis">
                  {{ submessage }}
                </div>

                <div v-if="showProgress && progress !== null" class="mt-4">
                  <v-progress-linear :model-value="progress" :color="color" height="6" rounded class="mx-auto"
                    style="max-width: 300px;" />
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
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useLoadingStore } from '@/stores/loading';

const loadingStore = useLoadingStore();
const { isLoading, loadingText } = storeToRefs(loadingStore);

const props = defineProps({
  bindToStore: {
    type: Boolean,
    default: true,
  },
  message: {
    type: String,
    default: undefined,
  },
  submessage: {
    type: String,
    default: undefined,
  },
  skeleton: {
    type: Boolean,
    default: false,
  },
  skeletonType: {
    type: String,
    default: 'table',
  },
  skeletonWidth: {
    type: [String, Number],
    default: '100%',
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
  size: {
    type: [String, Number],
    default: 64,
  },
  width: {
    type: [String, Number],
    default: 6,
  },
  color: {
    type: String,
    default: 'primary',
  },
  showProgress: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: null,
  },
});

const visible = computed(() => (props.bindToStore ? isLoading.value : true));

const displayMessage = computed(() => {
  if (props.message != null && props.message !== '') {
    return props.message;
  }
  if (props.bindToStore) {
    return loadingText.value;
  }
  return 'Loading data...';
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
    z-index: 10000;
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
