<template>
  <v-navigation-drawer
    :model-value="modelValue"
    location="end"
    temporary
    :scrim="false"
    width="305"
    class="filter-drawer"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-toolbar density="comfortable" color="surface" class="border-b">
      <v-toolbar-title class="text-h6 font-weight-medium">Filters</v-toolbar-title>
      <v-spacer />
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        aria-label="Close filters"
        @click="close"
      />
    </v-toolbar>

    <div class="filter-drawer__body pa-4">
      <section class="filter-section">
        <p class="text-body-2 font-weight-medium mb-2">ETD</p>
        <v-radio-group
          v-model="selectedEtd"
          hide-details="auto"
          density="comfortable"
          class="filter-radio-group"
        >
          <v-radio :value="FILTER_ALL" label="All" />
          <v-radio
            v-for="opt in etdOptions"
            :key="`etd-${opt}`"
            :value="opt"
            :label="String(opt)"
          />
        </v-radio-group>
      </section>

      <v-divider class="my-4" />

      <section class="filter-section">
        <p class="text-body-2 font-weight-medium mb-2">Shipment value</p>
        <v-radio-group
          v-model="selectedShipmentValue"
          hide-details="auto"
          density="comfortable"
          class="filter-radio-group"
        >
          <v-radio :value="FILTER_ALL" label="All" />
          <v-radio
            v-for="opt in shipmentValueOptions"
            :key="`sv-${opt}`"
            :value="opt"
            :label="String(opt)"
          />
        </v-radio-group>
      </section>

      <v-divider class="my-4" />

      <section class="filter-section">
        <p class="text-body-2 font-weight-medium mb-2">Shipment type</p>
        <v-radio-group
          v-model="selectedShipmentType"
          hide-details="auto"
          density="comfortable"
          class="filter-radio-group"
        >
          <v-radio :value="FILTER_ALL" label="All" />
          <v-radio
            v-for="opt in shipmentTypeOptions"
            :key="`st-${opt}`"
            :value="opt"
            :label="String(opt)"
          />
        </v-radio-group>
      </section>

      <v-divider class="my-4" />

      <section class="filter-section">
        <p class="text-body-2 font-weight-medium mb-2">Status</p>
        <v-radio-group
          v-model="selectedStatus"
          hide-details="auto"
          density="comfortable"
          class="filter-radio-group"
        >
          <v-radio :value="FILTER_ALL" label="All" />
          <v-radio
            v-for="opt in statusOptions"
            :key="`status-${opt}`"
            :value="opt"
            :label="String(opt)"
          />
        </v-radio-group>
      </section>

      <div class="d-flex flex-column gap-2 mt-6">
        <v-btn
          color="secondary"
          variant="outlined"
          block
          text="Clear"
          @click="clearFilters"
        />
        <v-btn color="primary" block text="Apply" @click="applyAndClose" />
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const FILTER_ALL = '__ALL__';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  panelTop: {
    type: Number,
    default: 0,
  },
  filterCriteria: {
    type: Object,
    required: true,
  },
  etdOptions: {
    type: Array,
    default: () => [],
  },
  shipmentValueOptions: {
    type: Array,
    default: () => [],
  },
  shipmentTypeOptions: {
    type: Array,
    default: () => [],
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'update:filterCriteria']);

const drawerTopCss = computed(() => `${Math.max(0, props.panelTop)}px`);
const drawerHeightCss = computed(() => `calc(100dvh - ${Math.max(0, props.panelTop)}px)`);

function toRadio(value) {
  return value == null || value === '' ? FILTER_ALL : value;
}

const selectedEtd = ref(FILTER_ALL);
const selectedShipmentValue = ref(FILTER_ALL);
const selectedShipmentType = ref(FILTER_ALL);
const selectedStatus = ref(FILTER_ALL);

function syncFromParentCriteria() {
  const c = props.filterCriteria || {};
  selectedEtd.value = toRadio(c.etd);
  selectedShipmentValue.value = toRadio(c.shipmentAmount);
  selectedShipmentType.value = toRadio(c.shipmentType);
  selectedStatus.value = toRadio(c.status);
}

function toCriteriaPayload() {
  return {
    etd: selectedEtd.value === FILTER_ALL ? null : selectedEtd.value,
    shipmentAmount:
      selectedShipmentValue.value === FILTER_ALL ? null : selectedShipmentValue.value,
    shipmentType:
      selectedShipmentType.value === FILTER_ALL ? null : selectedShipmentType.value,
    status: selectedStatus.value === FILTER_ALL ? null : selectedStatus.value,
  };
}

watch(
  () => props.filterCriteria,
  () => {
    syncFromParentCriteria();
  },
  { deep: true }
);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      syncFromParentCriteria();
    }
  }
);

const close = () => {
  emit('update:modelValue', false);
};

const clearFilters = () => {
  selectedEtd.value = FILTER_ALL;
  selectedShipmentValue.value = FILTER_ALL;
  selectedShipmentType.value = FILTER_ALL;
  selectedStatus.value = FILTER_ALL;
  emit('update:filterCriteria', {
    etd: null,
    shipmentAmount: null,
    shipmentType: null,
    status: null,
  });
};

const applyAndClose = () => {
  emit('update:filterCriteria', toCriteriaPayload());
  close();
};
</script>

<style scoped lang="scss">
.filter-drawer {
  top: v-bind(drawerTopCss) !important;
  height: v-bind(drawerHeightCss) !important;
  max-height: v-bind(drawerHeightCss) !important;

  :deep(.v-navigation-drawer__content) {
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    height: 100%;
    max-height: 100%;
  }
}

.border-b {
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.filter-drawer__body {
  flex: 1;
  overflow-y: auto;
}

.filter-radio-group {
  :deep(.v-radio) {
    margin-bottom: 4px;
  }
}
</style>
