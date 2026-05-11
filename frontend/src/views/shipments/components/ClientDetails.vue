<template>
    <v-row>
    <v-col cols="12" md="12">
        <v-card>
                <v-card-title>
                    Customer Details
                </v-card-title>
                <v-divider />
            <v-form ref="addFormRef" v-model="addFormValid" class="pa-2">                        
                            <v-autocomplete
                                label="Customer Name"
                                v-model="addForm.customer_id"
                                :items="customerAutocompleteItems"
                                :loading="customersLoading"
                                @update:modelValue="formStore.onCustomerSelected"
                                item-title="name"
                                item-value="id"
                                class="shipment-form mt-4"
                                variant="outlined"
                                placeholder="Select Customer Name"
                                clearable
                                />             
                            <v-radio-group 
                                v-if="isNewCustomer" 
                                v-model="addForm.customer_type" 
                                inline
                                class="shipment-form d-flex justify-space-between">
                                <v-radio 
                                label="Individual"
                                value="Individual"
                                />
                                <v-radio 
                                label="Business"
                                value="Business"
                                />
                            </v-radio-group>                                   

                            <template v-if="hasSelectedCustomer">
                                <v-row v-if="isNewCustomer">
                                    <v-col cols="6" md="6">
                                        <v-text-field
                                            label="First Name"
                                            v-model="addForm.first_name"
                                            class="shipment-form"
                                            variant="outlined"
                                            placeholder="Enter First Name"
                                            clearable
                                        />
                                    </v-col>
                                    <v-col cols="6" md="6">
                                        <v-text-field
                                            label="Last Name"
                                            v-model="addForm.last_name"
                                            class="shipment-form"
                                            variant="outlined"
                                            placeholder="Enter Last Name"
                                            clearable
                                        />
                                    </v-col>                   
                                </v-row>
                                <v-text-field
                                    v-if="isNewCustomer"
                                    label="Business Name"
                                    v-model="addForm.business_name"
                                    class="shipment-form"
                                    variant="outlined"
                                    placeholder="Enter Business Name"
                                    clearable
                                />  

                                <h4 class="pl-2 ma-0">Client Address <span class="required-fields">*</span></h4>  
                                <v-text-field
                                    label="Address"
                                    v-model="addForm.customer_address"
                                    class="shipment-form mt-2"
                                    variant="outlined"
                                    placeholder="Enter Address"
                                    clearable
                                /> 
                                <v-row class="ma-0 pa-0">
                                    <v-col cols="6">
                                        <v-text-field
                                            label="Zip Code"
                                            v-model="addForm.zip_code"
                                            class="shipment-form"
                                            variant="outlined"
                                            placeholder="Enter Zip Code"
                                            clearable
                                        />
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field
                                            label="TIN"
                                            v-model="addForm.tax_identification_no"
                                            class="shipment-form"
                                            variant="outlined"
                                            placeholder="Enter TIN"
                                            clearable
                                        />
                                    </v-col>
                                </v-row>
                                <v-row class="ma-0 pa-0">
                                    <v-col cols="6">
                                        <v-text-field
                                            label="Email Address"
                                            v-model="addForm.email"
                                            class="shipment-form"
                                            variant="outlined"
                                            placeholder="Enter Email Address"
                                            clearable
                                        />
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field
                                            label="Contact Number"
                                            v-model="addForm.contact_no"
                                            class="shipment-form"
                                            variant="outlined"
                                            placeholder="Enter Contact Number"
                                            clearable
                                        />
                                    </v-col>
                                </v-row>
                            </template>
                </v-form>
            </v-card>    
        </v-col>
    </v-row>
</template>
<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useShipmentsForm } from "@/views/shipments/store/shipmentFormStore.js";

const NEW_CUSTOMER_ID = "__new__";
const formStore = useShipmentsForm();
const { addForm, addFormValid, customerAutocompleteItems, loading: customersLoading } = storeToRefs(formStore);



const isNewCustomer = computed(() => addForm.value.customer_id === NEW_CUSTOMER_ID);
const hasSelectedCustomer = computed(() => !!addForm.value.customer_id);

onMounted(() => {
    formStore.fetchCustomerOptions();
});
</script>
<style lang="scss" scoped>
@use '../styles/shipments.scss' as shipments;


</style>