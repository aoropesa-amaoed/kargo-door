<template>
  <!-- <div class="shipments-page"> -->
    <v-container class="shipments-page__container mt-16 ml-2 pa-8" fluid>
      <div
        v-if="shipmentStore.loading"
        class="page-loader"
        role="status"
        aria-live="polite"
      >
        <v-progress-circular indeterminate color="primary" size="56" width="4" />
      </div>
    <!-- main content for shipments list -->
    <template v-if="tabStore.activeTab === 'Shipments'">  
    <!-- //action buttons and search bar -->
    <div ref="actionBarRef" class="action-bar">
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
                        @click="openFilterPanel"
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
    <ShipmentsFilter
      v-model="filterPanelOpen"
      v-model:filter-criteria="tableFilters"
      :etd-options="etdOptions"
      :shipment-value-options="shipmentValueOptions"
      :shipment-type-options="shipmentTypeOptions"
      :status-options="statusOptions"
      :panel-top="filterPanelTopPx"
    />
    <div
      class="table-container"
      :class="{ 'table-container--filter-shift': filterPanelOpen && tabStore.activeTab === 'Shipments' }"
    >
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
  <!-- </div> -->
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useTabStore } from '@/stores/tabStore.js';
import { useShipmentsTableStore } from '@/stores/tables/useShipmentsTable.js';
//action button 
import AddShipment from './AddShipment.vue';
import DataTable from '@/components/common/dataTable.vue';
import SearchBar from '@/components/common/SearchBar.vue';
//constants
import { headers as shipmentHeaders } from './constants/header.js';
//modal
import ExportParameter from '@/components/modals/ExportParameter.vue';
import ShipmentsFilter from '@/components/common/Filter.vue';

const tabStore = useTabStore();
const shipmentStore = useShipmentsTableStore();

const search = ref('');

onMounted(async () => {
  window.addEventListener('resize', onWindowResizeForFilter);
  try {
    await shipmentStore.fetch();
  } catch (err) {
    console.error('Error fetching shipments:', err);
  }
});

const openAddShipment = () => {
  tabStore.openAddShipment();
};
const tableFilters = ref({
  etd: null,
  shipmentAmount: null,
  shipmentType: null,
  status: null,
});

function normalizeEtdKey(row) {
  const v = row?.departure;
  if (v == null || v === '') return '';
  return String(v).slice(0, 10);
}

function shipmentValueDisplay(row) {
  const raw =
    row?.['shipment amount'] ?? row?.shipment_value ?? row?.shipmentValue ?? '';
  const s = String(raw ?? '').trim();
  return s;
}

const statusOptions = computed(() => {
  const set = new Set();
  for (const row of shipmentStore.shipments || []) {
    if (row?.status != null && String(row.status).trim() !== '') {
      set.add(row.status);
    }
  }
  return [...set].sort((a, b) => String(a).localeCompare(String(b)));
});

const etdOptions = computed(() => {
  const set = new Set();
  for (const row of shipmentStore.shipments || []) {
    const key = normalizeEtdKey(row);
    if (key) set.add(key);
  }
  return [...set].sort();
});

const shipmentValueOptions = computed(() => {
  const set = new Set();
  for (const row of shipmentStore.shipments || []) {
    const v = shipmentValueDisplay(row);
    if (v) set.add(v);
  }
  return [...set].sort((a, b) => String(a).localeCompare(String(b)));
});

const shipmentTypeOptions = computed(() => {
  const set = new Set();
  for (const row of shipmentStore.shipments || []) {
    const v = row?.shipment_type;
    if (v != null && String(v).trim() !== '') set.add(String(v));
  }
  return [...set].sort((a, b) => String(a).localeCompare(String(b)));
});

const filteredItems = computed(() => {
  let rows = shipmentStore.shipments || [];
  const f = tableFilters.value;

  if (f.status != null && f.status !== '') {
    rows = rows.filter(
      (item) => String(item.status ?? '') === String(f.status)
    );
  }
  if (f.shipmentType != null && f.shipmentType !== '') {
    rows = rows.filter(
      (item) => String(item.shipment_type ?? '') === String(f.shipmentType)
    );
  }
  if (f.shipmentAmount != null && f.shipmentAmount !== '') {
    rows = rows.filter(
      (item) => shipmentValueDisplay(item) === f.shipmentAmount
    );
  }
  if (f.etd != null && f.etd !== '') {
    rows = rows.filter((item) => normalizeEtdKey(item) === f.etd);
  }

  const q = search.value.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((item) => {
    return Object.values(item).some((value) => {
      return String(value ?? '').toLowerCase().includes(q);
    });
  });
});
//export
const exportModalOpen = ref(false);

const openExportModal = () => {
  exportModalOpen.value = true;
};

const filterPanelOpen = ref(false);
/** Top offset (px) for filter drawer = bottom of action bar (below Filter button row) */
const filterPanelTopPx = ref(140);
const actionBarRef = ref(null);

function measureFilterPanelTop() {
  const el = actionBarRef.value;
  if (!el?.getBoundingClientRect) return;
  filterPanelTopPx.value = Math.round(el.getBoundingClientRect().bottom);
}

function openFilterPanel() {
  measureFilterPanelTop();
  filterPanelOpen.value = true;
}

function onWindowResizeForFilter() {
  if (filterPanelOpen.value) {
    measureFilterPanelTop();
  }
}
watch(filterPanelOpen, async (open) => {
  if (open) {
    await nextTick();
    measureFilterPanelTop();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResizeForFilter);
});

const handleSearch = (value) => {
  search.value = value ?? '';
};

const headers = ref(shipmentHeaders);
</script>


<style lang="scss" scoped>
  @use './styles/shipments.scss' as shipments;
</style>