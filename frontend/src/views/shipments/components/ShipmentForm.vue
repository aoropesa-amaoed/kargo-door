<template>
                <v-row>                
                <v-col cols="12" md="12">
                    <v-card>
                        <v-card-title>Shipment Details</v-card-title>
                        <v-divider 
                          class="mb-2"
                          />
                        
                <v-form ref="addFormRef" v-model="addFormValid"
                          class="pa-2"
                        >
                                <v-autocomplete
                                v-model="addForm.commodity_id"
                                label="Commodity"
                                :items="commodityOptions"
                                :loading="commoditiesLoading"
                                item-title="name"
                                item-value="id"
                                class=""
                                variant="outlined"
                                placeholder="Select Commodity"
                                clearable
                                />
                                <v-text-field 
                                label="Description"
                                v-model="addForm.description"
                                class=""
                                variant="outlined"
                                placeholder="Enter Description"
                                clearable
                                />
                                <v-row class="mt-0 pa-0">
                                    <v-col cols="6">
                                    <v-text-field
                                    label="Shipment Value"
                                    v-model="addForm.shipment_value"
                                    class=""
                                    variant="outlined"
                                    placeholder="Enter Shipment Value"
                                    clearable
                                    />
                                    </v-col>
                                    <v-col cols="6">
                                    <v-text-field
                                    label="Markup Value"
                                    v-model="addForm.markup_value"
                                    class=""
                                    variant="outlined"
                                    placeholder="Enter Markup Value"
                                    clearable
                                    />
                                    </v-col>
                                </v-row>
                                <v-row class="mt-0 pa-0">
                                    <v-col cols="6">
                                    <v-text-field
                                    label="Insured Value"
                                    v-model="addForm.insured_value"
                                    class=""
                                    variant="outlined"
                                    placeholder="Enter Insured Value"
                                    clearable
                                    />
                                    </v-col>
                                    <v-col cols="6">
                                    <v-text-field
                                    label="Currency"
                                    v-model="addForm.currency"
                                    class=""
                                    variant="outlined"
                                    placeholder="Enter Currency"
                                    clearable
                                    />
                                    </v-col>
                                </v-row>
                            <v-text-field
                            label="Tracking No"
                            v-model="addForm.tracking_no"
                            class=""
                            variant="outlined"
                            placeholder="Enter Tracking No"
                            clearable
                            />
                            <v-text-field
                            label="LC No"
                            v-model="addForm.lc_no"
                            class=""
                            variant="outlined"
                            placeholder="Enter LC No"
                            clearable
                            />
                        </v-form>                                               
                    </v-card>
                </v-col>
                <!-- Voyage Details -->
                <v-col cols="12" md="12">
                    <v-card>
                        <v-card-title>Voyage Details</v-card-title>
                        <v-divider />
                        <v-form ref="addFormRef" v-model="addFormValid"
                        class="pa-2"
                        >
                        <v-row class="mt-4 pa-0">                                                  
                            <v-col cols="6">
                            <v-text-field
                            type="date"
                            label="ETD"
                            v-model="addForm.etd"
                            class=""
                            variant="outlined"
                            placeholder="Enter ETD"
                            clearable
                            />
                            </v-col>
                            <v-col cols="6">
                            <v-text-field
                            type="date"
                            label="ETA"
                            v-model="addForm.eta"
                            class=""
                            variant="outlined"
                            placeholder="Enter ETA"
                            clearable
                            />
                            </v-col>                        
                        </v-row>
                        <!-- origin details -->
                        <h4 class="pa-2 ma-0">Origin <span class="required-fields">*</span></h4>  
                        <v-row class="mt-0 pa-0">
                            <v-col cols="12" class="mt-0 pa-0">
                            <v-text-field
                            label="City"
                            v-model="addForm.origin_city"
                            class=""
                            variant="outlined"
                            placeholder="Enter City"
                            clearable
                            />
                            </v-col>
                        </v-row>
                        <v-row class="mt-0 pa-0">
                            <v-col cols="6">
                                <v-text-field
                                label="Region"
                                v-model="addForm.origin_region"
                                class="mt-0 pa-0"
                                variant="outlined"
                                placeholder="Enter Region"
                                clearable
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field
                                label="Country"
                                v-model="addForm.origin_country"
                                class="mt-0 pa-0"
                                variant="outlined"
                                placeholder="Enter Country"
                                clearable
                                />
                            </v-col>
                        </v-row>
                        <!-- destination details -->
                        <h4 class="pa-2 ma-0">Destination <span class="required-fields">*</span></h4>  
                        <v-row class="mt-0 pa-0">
                            <v-col cols="12" class="mt-0 pa-0">
                            <v-text-field
                            label="City"
                            v-model="addForm.destination_city"
                            class=""
                            variant="outlined"
                            placeholder="Enter City"
                            clearable
                            />
                            </v-col>
                        </v-row>
                        <v-row class="mt-0 pa-0">
                            <v-col cols="6">
                                <v-text-field
                                label="Region"
                                v-model="addForm.destination_region"
                                class="mt-0 pa-0"
                                variant="outlined"
                                placeholder="Enter Region"
                                clearable
                                />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field
                                label="Country"
                                v-model="addForm.destination_country"
                                class="mt-0 pa-0"
                                variant="outlined"
                                placeholder="Enter Country"
                                clearable
                                />
                            </v-col>
                        </v-row>
                        <!-- other details -->
                         <v-row class="mt-0 pa-0">
                            <v-col cols="12" class="mt-0 pa-0">
                                <v-text-field
                                label="Conveyance Type"
                                v-model="addForm.courier"
                                class=""
                                variant="outlined"
                                placeholder="Enter Conveyance Type"
                                clearable
                                />
                            </v-col>
                        </v-row>
                            <v-row class="mt-0 pa-0">
                                <v-col cols="12" class="mt-0 pa-0">
                                <v-text-field
                                label="Carrier Name"
                                v-model="addForm.carrier_name"
                                class=""
                                variant="outlined"
                                placeholder="Enter Carrier Name"
                                clearable
                                />
                            </v-col>
                            </v-row>                      
                        </v-form>
                    </v-card>                  
                </v-col>            
            </v-row>  
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useShipmentsForm } from '@/views/shipments/store/useShipmentsForm.js';

const formStore = useShipmentsForm();
const { addForm, commodityOptions, loading: commoditiesLoading } = storeToRefs(formStore);

onMounted(() => {
  formStore.fetchCommodityOptions();
});
</script>
<style scoped lang="scss">
:deep(.v-input__details){
    padding-top: 0px !important;
}

.required-fields{
    color: red;
}
</style>
