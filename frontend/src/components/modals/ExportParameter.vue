<template>
    <v-dialog v-model="isOpen" max-width="520">
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span>Export Shipment</span>
                <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    @click="closeModal"
                />
            </v-card-title>
            
            <v-card-text>
                <v-form v-model="formValid">
                    <v-row>
                        <v-col cols="12">
                            <h4 class="mb-3">Select Date Range</h4>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="formData.fromDate"
                                label="From"
                                type="date"
                                variant="outlined"
                                density="compact"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="formData.toDate"
                                label="To"
                                type="date"
                                variant="outlined"
                                density="compact"
                                
                            />
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            
            <v-card-actions class="pa-4">                
                <v-btn 
                  text="Cancel"
                  variant="outlined"
                  color="secondary"
                  :disabled="loading"
                  @click="closeModal"
                  class="cancel-button"
                  />
                  <v-btn
                  text="Export CSV"
                  variant="outline"                  
                  @click="handleExport"
                  class="export-button"
                  />
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useShipmentsTableStore } from '@/stores/tables/useShipmentsTable';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    exportType: {
        type: String,
        default: 'shipments',
        validator: (value) => [
            'shipments', 
            'quotations', 
            'payments', 
            'claims', 
            'policies'
        ].includes(value)
    }
});

const emit = defineEmits(['update:modelValue']);
const shipmentsStore = useShipmentsTableStore();

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const formValid = ref(false)

const loading = ref(false)
const formData = ref({
    fromDate:'',
    toDate:''

})

const closeModal = () => {
    isOpen.value = false;
    
};
const handleExport =async ()=>{
    loading.value = true;
    try {
        const fromDate = formData.value.fromDate || '';
        const toDate = formData.value.toDate || '';

        if (fromDate && toDate && fromDate > toDate) {
            window.alert('"From" date cannot be later than "To" date.');
            return;
        }

        if (props.exportType !== 'shipments') {
            window.alert('Export is currently available for shipments only.');
            return;
        }

        const getComparableDate = (item) => {
            return item?.eta || item?.etd || item?.created_at || item?.createdAt || '';
        };

        const filteredRows = shipmentsStore.shipments.filter((item) => {
            const candidate = getComparableDate(item);
            if (!candidate) return !fromDate && !toDate;

            const normalized = String(candidate).slice(0, 10);
            if (fromDate && normalized < fromDate) return false;
            if (toDate && normalized > toDate) return false;
            return true;
        });

        if (!filteredRows.length) {
            window.alert('No shipment records found for the selected date range.');
            return;
        }

        const keys = Array.from(
            filteredRows.reduce((acc, row) => {
                Object.keys(row || {}).forEach((key) => acc.add(key));
                return acc;
            }, new Set())
        );

        const escapeCell = (value) => {
            const stringValue = String(value ?? '');
            const escaped = stringValue.replace(/"/g, '""');
            return `"${escaped}"`;
        };

        const csvLines = [
            keys.map(escapeCell).join(','),
            ...filteredRows.map((row) => keys.map((key) => escapeCell(row[key])).join(','))
        ];

        const csvContent = csvLines.join('\n');
        const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement('a');
        const fromLabel = fromDate || 'all';
        const toLabel = toDate || 'all';

        link.href = downloadUrl;
        link.setAttribute('download', `shipments_${fromLabel}_to_${toLabel}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl); 
        closeModal();
    } finally {
        loading.value = false;
    }
}
</script>
<style lang="scss" scoped>
.v-card-title{
    border-bottom: 1px solid #e0e0e0;
}
.v-card-actions {
  border-top: 1px solid #e0e0e0;
  background-color: #fafafa;
}
.export-button{
    background-color: #ffcc00;
    width: 25%;
}
.cancel-button{
    width: 20%;
}
</style>