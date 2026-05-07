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
                                v-if="addForm.customer_id === '__new__'" 
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
                        
                                     
                
                        <v-row>
                            <v-col cols="6" md="6">
                                <v-text-field
                                    v-if="addForm.customer_id === '__new__' && addForm.customer_type === 'Individual'"
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
                                    v-if="addForm.customer_id === '__new__' && addForm.customer_type === 'Individual'"
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
                            v-if="addForm.customer_id === '__new__' && addForm.customer_type === 'Business'"
                            label="Business Name"
                            v-model="addForm.business_name"
                            class="shipment-form"
                            variant="outlined"
                            placeholder="Enter Business Name"
                            clearable
                            />                         
                </v-form>
            </v-card>    
        </v-col>
    </v-row>
</template>
<script setup>
import { onMounted,  } from 'vue';
import { storeToRefs } from 'pinia';
import { useShipmentsForm } from '@/views/shipments/store/useShipmentsForm.js';

const formStore = useShipmentsForm();
const { addForm, addFormValid, customerAutocompleteItems, loading: customersLoading } = storeToRefs(formStore);



onMounted(() => {
    formStore.fetchCustomerOptions();
});
</script>
<style lang="scss" scoped>
 .shipment-form{
    padding-left: 8px;
    padding-right:8px;
    
}
</style>