<template>
  <v-navigation-drawer
  v-model="drawerStore.isOpen"
  :rail="drawerStore.isRail"
  :rail-width="90"
  permanent
  width="250"
  class="sidebar">

  <!-- kargo logo toggle off -->
  <div v-if="!drawerStore.isRail" class="kargo-logo-container-toogle-off">
      <img :src="KargoLogoOff" alt="Kargo Door Logo" class="kargo-logo-off" />
    </div>
    <div v-if="drawerStore.isRail" class="kargo-logo-container-toogle-on">
      <img :src="KargoLogo" alt="Kargo Door Logo" class="kargo-logo" />
    </div>
    <!-- Collapsed button -->
    <div class="collapse-btn">
      <v-btn icon variant="text" size="small" color="white" @click.stop="drawerStore.toggleRail">
        <v-icon>{{ drawerStore.isRail ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
      </v-btn>
    </div>
  <!-- sidebar menu items -->
   <div class="sidebar-menu-container">
    <div class="sidebar-menu-items">
      <v-list>
       <!-- Quotations -->
        <v-list-item
            to="/quotations"
            class="menu-item"
            :class="{ 'custom-list-item': isActive('/quotations') }"
            :active="isActive('/quotations')"
            style="position: relative"
          >
            <template #prepend>
              <div v-if="isActive('/quotations') && !drawerStore.isRail" class="menu-rectangle"></div>
              <v-icon>mdi-file-outline</v-icon>
            </template>
            <template #title>
              <p class="menu-item-title" v-if="!drawerStore.isRail">Quotations</p>
            </template>
        </v-list-item>
        <!-- Certificates -->
         
         <v-list-item
            to="/certificates"
            class="menu-item"
            :class="{ 'custom-list-item': isActive('/certificates') }"
            :active="isActive('/certificates')"
            style="position: relative"
          >
            <template #prepend>
              <div v-if="isActive('/certificates') && !drawerStore.isRail" class="menu-rectangle"></div>
              <v-icon>mdi-file-document-outline</v-icon>
            </template>
            <template #title>
              <p class="menu-item-title" v-if="!drawerStore.isRail">Certificates</p>
            </template>
          </v-list-item>
          <!-- Referrals -->
          <v-list-item
            to="/referrals"
            class="menu-item"
            :class="{ 'custom-list-item': isActive('/referrals') }"
            :active="isActive('/referrals')"
            style="position: relative"
          >
            <template #prepend>
              <div v-if="isActive('/referrals') && !drawerStore.isRail" class="menu-rectangle"></div>
              <v-icon>mdi-swap-horizontal</v-icon>
            </template>
            <template #title>
              <p class="menu-item-title" v-if="!drawerStore.isRail">Referrals</p>
            </template>
          </v-list-item>
      </v-list>
      

    </div>
   </div>

  </v-navigation-drawer>
  </template>
<script setup>
import { useRoute } from 'vue-router'
import { useDrawerStore } from '@/stores/drawerStore'
import KargoLogo from '@/assets/image/sidebar-kargo-door-logo-2.png';
import KargoLogoOff from '@/assets/image/sidebar-kargo-door.png';

const route = useRoute()
const drawerStore = useDrawerStore()

const isActive = (path) => route.path === path
</script>

<style scoped>
.sidebar {  
  display: flex;
  flex-direction: column;
  background: #ffffff !important;
  position: fixed !important;
  height: 100vh !important;
  top: 0;
  left: 0;
}

.kargo-logo-container-toogle-off,
.kargo-logo-container-toogle-on {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;  
  transition: all 0.3s ease;
  position: relative;
  border-bottom: 1px solid #e0e0e0;
}

.kargo-logo-container-toogle-off {

  width: 100%;
  height: auto;
}

.kargo-logo-container-toogle-on {

  width: 100%;
  height: auto;
  justify-content: center;
}

.kargo-logo {
  width: 80px;
  height: 60px;
  object-fit: contain;
  transition: all 0.3s ease;
}

.kargo-logo-off {
  width: 200px;
  height: 60px;
  object-fit: contain;
  transition: all 0.3s ease;
}
.menu-item-title{
  margin-left: 1.5px;
}


:deep(.v-navigation-drawer--rail) {
  .kargo-logo-container-toogle-on {
    padding: 10px;
    
    .kargo-logo {
      width: 60px;
      height: 60px;
    }
  }
}


:deep(.v-navigation-drawer:not(.v-navigation-drawer--rail)) {
  .kargo-logo-container-toogle-off {
    padding: 20px;
    
    .kargo-logo-off {
      width: 200px;
      height: 200px;
    }
  }
}

.collapse-btn {
    position: absolute;
    right: -20px;
    top: 45px;
    z-index: 1;
    background: #3a3a3a;
    border-radius: 50%;
    border: 8px solid #ffffff;
    

   
  }

  :deep(.v-navigation-drawer--rail) .collapse-btn {
    right: -12px;
  }

  :deep(.v-navigation-drawer--rail) .logo-container {
    justify-content: center;
  }

  /* Force collapse button to be on top */
  .sidebar .collapse-btn {
    z-index: 9999 !important;
    position: fixed !important;
  }

  .sidebar-menu-container{
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0; /* Allows flexbox to shrink */
    gap: 200px;
  }

  .sidebar-menu-items {
    flex: 0 0 auto;
  }
  


</style>