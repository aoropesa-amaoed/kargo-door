<template>
  <v-container class="top-nav-bar-container" fluid>
    <v-row align="center" no-gutters class="h-100">
      <!-- Icon and Title -->
      <v-col cols="auto">
        <div 
          class="page-content" 
          :class="{ 
            'page-content-no-user': !isAuthenticated,
            'rail-mode': drawerStore.isRail 
          }"
        >
          <v-icon 
            v-if="currentIcon" 
            :icon="currentIcon" 
            class="page-icon me-2"
            :aria-label="`${currentPageTitle} page icon`"
          ></v-icon>
          <h2 class="page-title">{{ currentPageTitle }}</h2>
        </div>
      </v-col>
      
      <!-- Divider -->
      <v-col v-if="tabItems.length" cols="auto">
        <v-divider 
          vertical
          class="mx-6 top-nav-divider"
        />
      </v-col>
      
      <!-- Secondary tabs (e.g. New Shipment) -->
      <v-col cols="auto">
        <div>
          <v-tabs
            v-if="tabItems.length"
            :model-value="activeTabIndex"
            density="compact"
            hide-slider
            class="secondary-tabs"
            @update:model-value="handleActiveTabChange"
          >
            <v-tab
              v-for="(tab, index) in tabItems"
              :key="tab.id"
              :value="index"
              class="text-none subtab-pill"
            >
              <span class="me-2">{{ tab.label }}</span>
              <v-btn
                v-if="tab.hasCloseIcon"
                icon
                size="x-small"
                variant="text"
                class="subtab-close-btn"
                @click.stop="closeSubTab(tab)"
              >
                <v-icon icon="mdi-close" size="16" />
              </v-btn>
            </v-tab>
          </v-tabs>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useDrawerStore } from '@/stores/drawerStore';
import { useTabStore } from '@/stores/tabStore.js';

const route = useRoute();
const router = useRouter();
const { isAuthenticated } = useAuth();
const drawerStore = useDrawerStore();
const tabStore = useTabStore();

/**
 * Gets the current page title from route meta or route name
 * @returns {string} Page title with first letter capitalized
 */
const currentPageTitle = computed(() => {
  const path = route.path;
  
  // Get base page title from route
  let baseTitle = '';
  if (path === '/shipments' || path === '/shipments/new') {
    baseTitle = 'Shipments';
  } else if (path === '/quotations' || path === '/quotations/new') {
    baseTitle = 'Quotations';
  } else {
    const title = route.meta?.title || route.name?.toString() || '';
    baseTitle = title ? title.charAt(0).toUpperCase() + title.slice(1) : '';
  }
  
  return baseTitle;
});

/**
 * Icon mapping for different routes
 * Maps route names to Material Design Icons
 * Falls back to 'mdi-file-document-outline' if route not found
 */
const iconMap = {
  Quotations: 'mdi-account-multiple-outline',
  Certificates: 'mdi-account-multiple-outline',
  Referrals: 'mdi-swap-horizontal',
  ReferralView: 'mdi-swap-horizontal',
  QuotationView: 'mdi-file-document-outline',
  QuotationShipmentVoyageDetails: 'mdi-file-document-edit-outline',
  PurchaseOnInvoiceSuccess: 'mdi-check-circle-outline',
  CertificateView: 'mdi-file-document-outline',
  CertificatePdfViewer: 'mdi-file-pdf-box',
  CustomCertificatePdfViewer: 'mdi-file-pdf-box',
  QuotationPdfViewer: 'mdi-file-pdf-box',
  Users: 'mdi-account-multiple',
  AddUser: 'mdi-account-plus',
};

const currentIcon = computed(() => {
  const path = route.path;
  // Use route path directly to avoid circular dependency
  if (path === '/quotations/new') {
    return 'mdi-file-document-edit-outline';
  }
  if (path === '/shipments/new' || (path === '/shipments' && tabStore.activeTab === 'add')) {
    return 'mdi-file-document-edit-outline';
  }
  const name = route.name?.toString();
  if (name && iconMap[name]) return iconMap[name];
  return 'mdi-file-document-outline';
});

/**
 * Ref for tab items (must be ref, not computed, for Tab component v-model:items)
 * Tab component needs to modify this array when closing tabs
 */
const tabItems = ref([]);

/**
 * Watch store state and update tabItems ref accordingly
 */
watch(
  [() => route.path, () => tabStore.isAddQuotationTab, () => tabStore.tabs.length, () => tabStore.activeTab],
  ([currentPath, isNewQuotationTab]) => {
    const isNewShipmentTab = tabStore.tabs.some(t => t.name === 'add');
    
    if (currentPath === '/quotations') {
      if (isNewQuotationTab) {
        tabItems.value = [
          { id: 'add-quotation', label: 'New Quotation', hasCloseIcon: true },
        ];
      } else {
        tabItems.value = [];
      }
      return;
    }
    if (currentPath === '/shipments') {
      if (isNewShipmentTab) {
        tabItems.value = [
          { id: 'add-shipment', label: 'Add Shipment', hasCloseIcon: true },
        ];
      } else {
        tabItems.value = [];
      }
      return;
    }
    tabItems.value = [];
  },
  { immediate: true }
);

/**
 * Active tab index - derived from route path (avoids circular dependency)
 */
const activeTabIndex = computed(() => {
  const path = route.path;
  if (path === '/quotations/new' || (path === '/shipments' && tabStore.activeTab === 'add')) {
    return 0;
  }
  return 0;
});

/**
 * When the only tab is closed, reset tab state
 */
watch(
  () => tabItems.value.length,
  (newLength, oldLength) => {
    if (oldLength !== 1 || newLength !== 0) return;
    // if (route.path === '/quotations') {
    //   tabStore.resetToDefaultQuotationsTab();
    // }
    if (route.path === '/shipments') {
      tabStore.closeShipmentTab();
      router.push('/shipments');
    }
  }
);

function closeSubTab(payload) {
  const tab =
    typeof payload === 'number'
      ? tabItems.value[payload]
      : payload;

  if (tab?.id === 'add-quotation' || route.path === '/quotations/new') {
    tabStore.closeQuotationTab();
    router.push('/quotations');
  } else if (tab?.id === 'add-shipment' || route.path === '/shipments') {
    tabStore.closeShipmentTab();
    router.push('/shipments');
  }
}

function handleActiveTabChange(index) {
  const tab = tabItems.value[index];
  if (tab?.id === 'add-shipment') {
    tabStore.setActiveTab('add');
    if (route.path !== '/shipments') {
      router.push('/shipments');
    }
  }
}
</script>

<style lang="scss" scoped>

.top-nav-bar-container {
  width: 100%;
  height: 80px;
  gap: 18px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-icon {
  width: 18px;
  height: 18px;
  border-width: 2px;
  color: rgba(0, 0, 0, 0.6);
}

.page-section {
  display: flex;
  align-items: center;
  justify-content: start;
  margin-top: 36px;
}

.page-content {
  display: flex;
  align-items: center;
  margin-left: 15.625rem;
  transition: margin-left 0.3s ease; 
}
/* Adjust position when sidebar is collapsed */
.page-content.rail-mode {
  margin-left: 5.5rem;
}

.page-content-no-user {
  margin-left: 0;
  justify-content: center;
}

.page-title {
  font-size: 22px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.87);
  line-height: 26px;
}

:deep(.secondary-tabs) {
  background: transparent;
  box-shadow: none;
}

:deep(.secondary-tabs .v-slide-group__content) {
  gap: 8px;
}

:deep(.secondary-tabs::before),
:deep(.secondary-tabs::after),
:deep(.secondary-tabs .v-slide-group::before),
:deep(.secondary-tabs .v-slide-group::after) {
  display: none !important;
}

:deep(.secondary-tabs .subtab-pill) {
  min-width: unset;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 700;
  font-size: 1.55rem;
  color: #111111;
  background-color: #efe7ad;
  border-radius: 6px 6px 0 0;
  border-bottom: 4px solid #111111;
  padding: 8px 16px;
}

:deep(.secondary-tabs .subtab-pill .v-tab__slider) {
  display: none;
}

:deep(.secondary-tabs .subtab-pill .v-btn__content) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

:deep(.secondary-tabs .subtab-close-btn) {
  color: #1a1a1a;
  opacity: 0.9;
}

.top-nav-divider {
  height: 48px;
  border-color: rgba(0, 0, 0, 0.28);
  opacity: 1;
}
</style>