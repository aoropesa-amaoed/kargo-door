<template>
  <v-row>
    <v-col cols="12" md="12">
      <v-card>
        <v-card-title>Shipment Details</v-card-title>
        <v-divider class="mb-2" />
        <v-form ref="shipmentFormRef" v-model="shipmentFormValid" class="pa-2">
          <v-autocomplete v-model="formData.commodity_id" label="Commodity" :items="commodityOptions"
            :loading="commoditiesLoading" item-title="name" item-value="id" class="shipment-form mt-4"
            variant="outlined" placeholder="Select Commodity" clearable />
          <v-text-field label="Description" v-model="formData.description" class="shipment-form" variant="outlined"
            placeholder="Enter Description" clearable />
          <v-row>
            <v-col cols="6">
              <v-text-field label="Shipment Value" :model-value="formData.shipment_value"
                @update:model-value="onShipmentValueInput" @focus="onShipmentValueFocus" @blur="onShipmentValueBlur"
                class="shipment-form" variant="outlined" placeholder="Enter Shipment Value" clearable required />
            </v-col>
            <v-col cols="6">
              <v-text-field label="Markup Value" v-model="formData.markup_value" class="shipment-form"
                variant="outlined" placeholder="Enter Markup Value" disabled required />
            </v-col>
          </v-row>
          <v-row class="mt-0">
            <v-col cols="6">
              <v-text-field label="Insured Value" v-model="formData.insured_value" class="shipment-form"
                variant="outlined" disabled required />
            </v-col>
            <v-col cols="6">
              <v-text-field label="Currency" v-model="formData.currency" class="shipment-form" variant="outlined"
                placeholder="Enter Currency" clearable />
            </v-col>
          </v-row>
          <v-text-field label="Tracking No" v-model="formData.tracking_no" class="shipment-form" variant="outlined"
            placeholder="Enter Tracking No" clearable />
          <v-text-field label="LC No" v-model="formData.lc_no" class="shipment-form" variant="outlined"
            placeholder="Enter LC No" clearable />
        </v-form>
      </v-card>
    </v-col>
    <v-col cols="12" md="12">
      <!-- Voyage Details -->
      <v-card class="mt-4">
        <v-card-title>Voyage Details</v-card-title>
        <v-divider />
        <v-form ref="voyageFormRef" v-model="voyageFormValid" class="pa-2">
          <v-row class="mb-0">
            <v-col cols="6">
              <v-text-field type="date" label="ETD" v-model="formData.etd" class="shipment-form mt-4" variant="outlined"
                placeholder="Enter ETD" clearable />
            </v-col>
            <v-col cols="6">
              <v-text-field type="date" label="ETA" v-model="formData.eta" class="shipment-form mt-4" variant="outlined"
                placeholder="Enter ETA" clearable />
            </v-col>
          </v-row>
          <!-- origin details -->
          <h4 class="pl-2 ma-0">
            Origin <span class="required-fields">*</span>
          </h4>
          <v-text-field label="City" v-model="formData.origin_city" class="shipment-form mt-2" variant="outlined"
            placeholder="Enter City" clearable />
          <v-row>
            <v-col cols="6">
              <v-text-field label="Region" v-model="formData.origin_region" class="shipment-form" variant="outlined"
                placeholder="Enter Region" clearable />
            </v-col>
            <v-col cols="6">
              <v-text-field label="Country" v-model="formData.origin_country" class="shipment-form" variant="outlined"
                placeholder="Enter Country" clearable />
            </v-col>
          </v-row>
          <!-- destination details -->
          <h4 class="pl-2 ma-0">
            Destination <span class="required-fields">*</span>
          </h4>
          <v-text-field label="City" v-model="formData.destination_city" class="shipment-form mt-2" variant="outlined"
            placeholder="Enter City" clearable />
          <v-row>
            <v-col cols="6">
              <v-text-field label="Region" v-model="formData.destination_region" class="shipment-form"
                variant="outlined" placeholder="Enter Region" clearable />
            </v-col>
            <v-col cols="6">
              <v-text-field label="Country" v-model="formData.destination_country" class="shipment-form"
                variant="outlined" placeholder="Enter Country" clearable />
            </v-col>
          </v-row>
          <!-- other details -->
          <v-text-field label="Conveyance Type" v-model="formData.courier" class="shipment-form" variant="outlined"
            placeholder="Enter Conveyance Type" clearable />
          <v-text-field label="Carrier Name" v-model="formData.carrier_name" class="shipment-form" variant="outlined"
            placeholder="Enter Carrier Name" clearable />
        </v-form>
      </v-card>

    </v-col>

  </v-row>



</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";

import { useShipmentStore, toNumber, formatAmountWithCommas } from "../store/shipment.js";

const formStore = useShipmentStore();
const { addForm: formData, commodityOptions, commoditiesLoading } = storeToRefs(formStore);

function normalizeShipmentValueInput(val) {
  if (val === null || val === undefined || val === "") return null;
  let s = String(val).replace(/,/g, "").replace(/[^\d.]/g, "");
  const dot = s.indexOf(".");
  if (dot !== -1) {
    s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, "");
  }
  return s === "" ? null : s;
}

function onShipmentValueInput(val) {
  formData.value.shipment_value = normalizeShipmentValueInput(val);
}

function onShipmentValueFocus() {
  const raw = formData.value.shipment_value;
  if (raw === null || raw === undefined || raw === "") return;
  const n = toNumber(raw, NaN);
  if (Number.isFinite(n)) {
    formData.value.shipment_value = String(n);
  }
}

function onShipmentValueBlur() {
  const raw = formData.value.shipment_value;
  if (raw === null || raw === undefined || raw === "") {
    formData.value.shipment_value = null;
    return;
  }
  const n = toNumber(raw, NaN);
  if (!Number.isFinite(n)) {
    formData.value.shipment_value = null;
    return;
  }
  formData.value.shipment_value = formatAmountWithCommas(n);
}

// Form refs and validation
const shipmentFormValid = ref(false);
const voyageFormValid = ref(false);

// Computed properties
const canAccessStep3 = computed(() => {
  return (
    shipmentFormValid.value && voyageFormValid.value
  );
});

onMounted(async () => {
  await Promise.all([
    formStore.fetchCommodityOptions(),
    formStore.hydrateMarkupFromProfile(),
  ]);
});
</script>
<style scoped lang="scss">
@use "../styles/shipments.scss" as shipments;

:deep(.v-input__details) {
  padding-top: 0px !important;
}
</style>
