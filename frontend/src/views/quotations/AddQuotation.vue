<template>
    <v-container class="mt-16" fluid>
        <div>
            <v-row>
                <!-- Shipment Details -->
                <v-col cols="12" md="12">
                    <v-card>
                        <v-card-title>Shipment Details</v-card-title>
                        <v-divider class="mb-2"></v-divider>
                        <v-form>
                            <v-autocomplete
                            label="Policy Name"
                            :items="policies"
                            item-title="name"
                            item-value="id"
                            class="ma-2 pa-4"
                            />  
                            <v-autocomplete
                            label="HS Codes"
                            :items="hsCodes"
                            item-title="name"
                            item-value="id"
                            class="ma-2 pa-4"
                            />
                                
                        </v-form>
                        
                    </v-card>


                </v-col>
                <!-- Voyage Details -->
                <v-col cols="12" md="12">

                </v-col>
            </v-row>    
        </div>
   
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPolicies } from '@/services/redkik/api';

const policies = ref([]);

onMounted(async () => {
    try {
      policies.value = await getPolicies();
    } catch (error) {
      console.error('Failed to load quote setup policies:', error);
      policies.value = [];
    }
});

</script>

<style scoped>

</style>