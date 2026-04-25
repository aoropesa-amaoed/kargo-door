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
          class="mx-6" 
          vertical
        />
      </v-col>
      
      <!-- Secondary tabs (e.g. New Quotation) -->
      <v-col cols="auto">
        <div
          v-if="tabItems.length"
          class="quotation-tabs d-flex align-center flex-wrap"
        >
          <v-chip
            v-for="(item, index) in tabItems"
            :key="item.id"
            class="ma-1 text-none"
            :variant="index === activeTabIndex ? 'flat' : 'outlined'"
            :color="index === activeTabIndex ? 'primary' : undefined"
            :closable="item.hasCloseIcon"
            @click="activeTabIndex = index"
            @click:close.stop="closeSubTab(index)"
          >
            {{ item.label }}
          </v-chip>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/redkik/useAuth';
import { useDrawerStore } from '@/stores/drawerStore';
import { useTabStore } from '@/stores/tabStore.js';

const route = useRoute();
const { isAuthenticated } = useAuth();
const drawerStore = useDrawerStore();
const tabStore = useTabStore();

/**
 * Gets the current page title from route meta or route name
 * @returns {string} Page title with first letter capitalized
 */
const currentPageTitle = computed(() => {
  if (route.path === '/quotations') {
    return 'Quotation';
  }

  const title = route.meta?.title || route.name?.toString() || 'Page';
  return title.charAt(0).toUpperCase() + title.slice(1);
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
  if (route.path === '/quotations' && tabStore.isAddQuotationTab) {
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
  [() => route.path, () => tabStore.isAddQuotationTab],
  ([currentPath, isNewQuotationTab]) => {
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
    tabItems.value = [];
  },
  { immediate: true }
);

/**
 * Computed property for active tab index (synced with tabStore.activeTab)
 */
const activeTabIndex = computed({
  get: () => {
    const index = tabItems.value.findIndex(
      (tab) => tab.id === tabStore.activeTab
    );
    return index >= 0 ? index : 0;
  },
  set: (index) => {
    const tab = tabItems.value[index];
    if (!tab) return;
    tabStore.setActiveTab(tab.id);
  },
});

/**
 * When the only tab is closed, reset quotations tab state
 */
watch(
  () => tabItems.value.length,
  (newLength, oldLength) => {
    if (oldLength !== 1 || newLength !== 0) return;
    if (route.path === '/quotations') {
      tabStore.resetToDefaultQuotationsTab();
    }
  }
);

function closeSubTab(index) {
  tabItems.value.splice(index, 1);
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
</style>