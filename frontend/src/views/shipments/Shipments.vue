//main content
<template>
    <v-container  class="mt-16 ml-2 pa-8" fluid>         
    <!-- main content for shipments list -->
    <template v-if="tabStore.activeTab === 'Shipments'">  
    <!-- //action buttons and search bar -->
    <div class="action-bar">
        <v-row class="gap-0">
            <v-col cols="12" md="6" class="d-flex justify-start align-center">
                <!-- //search bar -->
                <SearchBar 
                  @search="handleSearch"
                  v-model="search"
                  label="Search"
                  />               
            </v-col>
            <v-col cols="12" md="6" class="d-flex justify-end align-center">                <!-- //action buttons -->
                <v-row class="tab-row-tight" align="center" >
                    <v-col cols="12" md="6">
                        <v-btn 
                       @click="openAddShipment()"
                        class="action-button"
                        color="primary"
                        prepend-icon="mdi-plus"
                        >New Shipment </v-btn>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-btn 
                        class="action-button"
                        color="secondary"
                        prepend-icon="mdi-export"
                        @click="openExportModal"
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
    <ExportParameter
      v-model="exportModalOpen"
      export-type="shipments"
    />
    <div class="table-container">
      <DataTable
        :headers="headers"
        :items="filteredItems"
        
      />     
    </div>
    </template>
    <!-- main content for new shipment form -->
      <template v-else-if="tabStore.activeTab === 'add'">
        <AddShipment />  
      </template>
    
    </v-container>
 
</template>
//new shipment form

<script setup>
import { computed, ref, onMounted} from 'vue';

import { useTabStore } from '@/stores/tabStore.js';
import { useShipmentsTableStore } from '@/stores/tables/useShipmentsTable.js';
//action button 
import AddShipment from './AddShipment.vue';
import DataTable from '@/components/common/dataTable.vue';
import SearchBar from '@/components/common/SearchBar.vue';
//modal
import ExportParameter from '@/components/modals/ExportParameter.vue';

const tabStore = useTabStore();
const shipmentStore = useShipmentsTableStore();

const search = ref('');

onMounted(async () => {
  try {
    await shipmentStore.fetch();
  } catch (err) {
    console.error('Error fetching shipments:', err);
  }
});

//create new shipment

const openAddShipment = () => {
  tabStore.openAddShipment();
};

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return shipmentStore.shipments;
  return shipmentStore.shipments.filter((item) => {
    return Object.values(item).some((value) => {
      return String(value ?? '').toLowerCase().includes(q);
    });
  });
  
})
//export
const exportModalOpen = ref(false);

const openExportModal = () => {
  exportModalOpen.value = true;
};

const handleSearch = (value) => {
  search.value = value ?? '';
};

const headers = ref([
  { title: 'Action', key: 'action', sortable: false },
  { title: 'Shipment Type', key: 'shipment_type' },
  { title: 'Shipment Number', key: 'id', sortable:true},
  { title: 'Status', key: 'status' },
  { title: 'Commodity', key: 'commodity_name' },
  { title: 'Description', key: 'description' },
  {title: 'Shipment Value', key: 'shipment amount'},
  { title: 'Insurer Value', key: 'insured amount' },    
  { title: 'ETD', key: 'departure', format: 'date' ,sortable:true },
  { title: 'ETA', key: 'arrival', format: 'date',sortable:true },
  
  { title: 'Origin', key: 'origin_address'},
  { title: 'Destination', key: 'destination_address'},
  { title: 'Courier', key: 'courier' },
  
  { title: 'Tracking No', key: 'tracking_no' },
  { title: 'LC No', key: 'lc_no' },
 
]);

</script>

<style scoped lang="scss">


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