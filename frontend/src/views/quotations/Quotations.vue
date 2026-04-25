<template>
    <v-container  class="mt-16 ml-2 pa-8" fluid>        
    <!-- //action buttons and search bar -->
    <div class="action-bar">
        <v-row class="gap-0">
            <v-col cols="12" md="6" class="d-flex justify-start align-center">
                <!-- //search bar -->
                <v-text-field
                    v-model="search"
                    label="Search"
                    prepend-inner-icon="mdi-magnify"
                    clearable
                    variant="outlined"                
                    class="search-bar mt-2"
                ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="d-flex justify-end align-center">
                <!-- //action buttons -->
                <v-row class="tab-row-tight" align="center" >
                    <v-col cols="12" md="6">
                        <v-btn 
                        to="/quotations/new"
                        class="action-button"
                        color="primary"
                        prepend-icon="mdi-plus"
                        >New Quote</v-btn>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-btn 
                        class="action-button"
                        color="secondary"
                        prepend-icon="mdi-export"
                        >Export</v-btn>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-btn 
                        class="action-button"
                        color="tertiary"
                        prepend-icon="mdi-filter"
                        variant="outlined"
                        >Filter</v-btn>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </div>
    <div class="table-container">
        <Table
            :headers="headers"
            :items="filteredItems"
            :loading="loading"
            :total-items="filteredTotalItems"
            :items-per-page="itemsPerPage"
            :on-update-options="handleTableUpdate"
            :data-select-type="false"
            :unique-key="'id'"
            :frozen-column="0"
            :button-columns="buttonColumns"
            :set-status-badges="statusBadges"
            @item-click="handleItemClick"
            @button-click="handleButtonClick"
            :multi-sort="false"
         />
    </div>
    
    </v-container>
</template>
<script setup>
import { computed, ref } from 'vue';
import Table from '@/components/Table.vue';

const search = ref('');
const loading = ref(false);
const itemsPerPage = ref(10);

const headers = ref([
  { title: 'Action', key: 'action', sortable: false },
  { title: 'Quotation Number', key: 'quotation_no' },
  { title: 'Status', key: 'status' },
  { title: 'Commodity', key: 'commodity' },
  { title: 'Total Premium', key: 'total_premium', format: 'amount' },
  { title: 'Quotation Date', key: 'quote_date', format: 'date' },
  { title: 'Quotation Expiry Date', key: 'expiry_date', format: 'date' },
  { title: 'User', key: 'user' },
  { title: 'Consignee', key: 'consignee' },
]);

const items = ref([
  {
    id: 1,
    quotation_no: 'Q-0001',
    status: 'Pending',
    commodity: 'Commodity',
    total_premium: 100,
    quote_date: '2026-01-01',
    expiry_date: '2026-01-01',
    user: 'John Doe',
    consignee: 'John Doe',
  },
]);

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return items.value;
  return items.value.filter((item) =>
    Object.values(item).some((value) =>
      String(value ?? '').toLowerCase().includes(q)
    )
  );
});

const filteredTotalItems = computed(() => filteredItems.value.length);

const buttonColumns = ref([]);
const statusBadges = ref([
  {
    column: 'status',
    styles: [
      { data: 'Pending', status: 'warning', variant: 'tonal', label: 'Pending' },
    ],
  },
]);

const handleTableUpdate = () => {};
const handleItemClick = () => {};
const handleButtonClick = () => {};
</script>

<style scoped lang="scss">

.search-bar{
    width: 100%;    
    max-width: 80%;
    margin-right: 10px;
}
.action-button{    
    padding: 4px 8px;
    height: 50px;
    width: 100%;    
}
:deep(.tab-row-tight) {
  --v-col-gap-x: 8px;
}
// table-section
.table-container{
    margin-top: 20px;
}
</style>