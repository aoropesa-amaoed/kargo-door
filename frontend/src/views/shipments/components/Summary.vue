<template>
    
        <v-row>
            <!-- Shipment Summary -->
            <v-col cols="12" md="6">
                <v-card>
                <v-card-title>Shipment Summary</v-card-title>
                <v-divider />
                <v-card-text>
                    <div class="summary-item">
                        <span class="summary-label">Commodity:</span>
                        <span class="summary-value">{{ addForm.commodity_id ? getCommodityName(addForm.commodity_id) : 'Not selected' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Description:</span>
                        <span class="summary-value">{{ addForm.description || 'Not provided' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Shipment Value:</span>
                        <span class="summary-value">{{ addForm.shipment_value ? `${addForm.currency || ''} ${addForm.shipment_value}` : 'Not provided' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Insured Value:</span>
                        <span class="summary-value">{{ addForm.insured_value ? `${addForm.currency || ''} ${addForm.insured_value}` : 'Not provided' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Origin:</span>
                        <span class="summary-value">{{ formatAddress(addForm.origin_city, addForm.origin_region, addForm.origin_country) }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Destination:</span>
                        <span class="summary-value">{{ formatAddress(addForm.destination_city, addForm.destination_region, addForm.destination_country) }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Shipment Type:</span>
                        <span class="summary-value">{{ shipmentType }}</span>
                    </div>
                </v-card-text>
                </v-card>
            </v-col>
            
            <!-- Customer Summary -->
            <v-col cols="12" md="6">
                <v-card>
                <v-card-title>Customer Summary</v-card-title>
                <v-divider />
                <v-card-text>
                    <div class="summary-item">
                        <span class="summary-label">Customer:</span>
                        <span class="summary-value">{{ addForm.customer_name || 'Not selected' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Type:</span>
                        <span class="summary-value">{{ addForm.customer_type || 'Not specified' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Contact:</span>
                        <span class="summary-value">{{ addForm.email || 'Not provided' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Address:</span>
                        <span class="summary-value">{{ addForm.customer_address || 'Not provided' }}</span>
                    </div>
                </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    
</template>
<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useShipmentsForm } from "@/views/shipments/store/shipmentFormStore.js";

const formStore = useShipmentsForm();
const { addForm, commodityOptions, shipmentType } = storeToRefs(formStore);

const getCommodityName = (id) => {
  const commodity = commodityOptions.value.find((c) => c.id === id);
  return commodity ? commodity.name : "";
};

const formatAddress = (city, region, country) => {
  const parts = [city, region, country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Not provided';
};
</script>
<style lang="scss" scoped>
</style>