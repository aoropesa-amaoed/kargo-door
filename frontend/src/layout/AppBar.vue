<template>
    <v-app-bar class="app-bar" flat>
      <v-container class="d-flex align-center px-6 justify-space-between" fluid>
        <div class="logo-container d-flex align-center">
          <img 
            :src="logoImage" 
            class="logo_black"
            alt="Logo"          
          />
        </div>  
        <v-spacer />  
        <!-- Right side controls -->
        <div class="right-controls d-flex align-center">
          <!-- Notification Icon -->
          <div class="notification-wrapper me-4">
            <v-btn 
              icon 
              class="notification-btn"
              :aria-label="`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`"
            >
              <v-icon>mdi-bell-outline</v-icon>
            </v-btn>
            <div 
              v-if="notificationCount > 0" 
              class="custom-badge"
              :aria-label="`${notificationCount} unread notifications`"
            >
              {{ notificationCount > 99 ? '99+' : notificationCount }}
            </div>
          </div>
    <v-menu v-if="isAuthenticated" 
    class="user-menu"
    content-class="user-menu-overlay"
    :elevation="8"
    >
    <template v-slot:activator="{ props }">
      <v-btn
        variant="text"
        class="user-menu-button"
        v-bind="props"
        :aria-label="`User menu for ${userInitial}`"
        :aria-expanded="props['aria-expanded']"
      >
        <v-avatar 
          size="36" 
          class="user-avatar"
        >
          <div class="user-initial">{{ userInitial }}</div>
        </v-avatar>
        <v-icon 
          size="small" 
          class="dropdown-icon ms-1"
        >
          mdi-chevron-down
        </v-icon>
      </v-btn>
    </template>
    <v-list class="user-menu-list elevation-0">
      <v-list-item
        v-for="(item, i) in userMenuItems"
        :key="i"
        :value="i"
        :title="item.title"
        :prepend-icon="item.icon"
        :disabled="item.disabled"
        
        @click="handleMenuItemClick(item)"
      />
    </v-list>
</v-menu>
          
        </div>
      </v-container>
    </v-app-bar>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuth } from '@/composables/useAuth';
  import logoImage from '@/assets/image/maagap_logo_emarine.png';

  const router = useRouter();
  const { token, user, isAuthenticated, logout } = useAuth();
  
  
  /**
   * Notification count - currently a placeholder
   * TODO: Connect to notification service/store when available
   * @returns {number} Number of unread notifications
   */
  const notificationCount = computed(() => {
    // TODO: Connect to notification service/store
    // For now, return 0 to hide badge until notification system is implemented
    return 0;
  });
  
  /**
   * User menu items configuration
   * @returns {Array} Array of menu item objects with title, icon, and action
   */
  const userMenuItems = computed(() => [
    {
      title: 'Profile Settings',
      icon: 'mdi-account-cog',
      action: () => {
        // Check if profile route exists before navigating
        // For now, we'll handle gracefully if route doesn't exist
        try {
          router.push({ name: 'Profile' }).catch(() => {
            console.warn('Profile route not available');
          });
        } catch (error) {
          console.error('Error navigating to profile:', error);
        }
      },
    },
    {
      title: 'Logout',
      icon: 'mdi-logout',
      action: () => {
        try {
          logout();
        } catch (error) {
          console.error('Error logging out:', error);
        }
      },
    },
  ]);

  const handleMenuItemClick = (item) => {
    if (item.action) {
      try {
        item.action();
      } catch (error) {
        console.error('Error executing menu item action:', error);
      }
    }
  };
 
  const userInitial = computed(() => {
    if (!user.value) return '?';
    
    // Try to get initial from name first, then email
    if (user.value.name) {
      return user.value.name.charAt(0).toUpperCase();
    }
    if (user.value.email) {
      return user.value.email.charAt(0).toUpperCase();
    }
    return '?';
  });
  </script>
  
  <style lang="scss" scoped>
  
  
  .app-bar {
    display: flex;
    height: 60px !important;
    padding: 0;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    align-self: stretch;
    background: #ffcc00 !important; 
    position: relative;
    box-shadow: none !important;
  }
  
  .app-bar :deep(.v-container) {
    height: 100%;
    display: flex;
    align-items: center;
  }
  
  /* Logo Section */
  .logo-container {
    width: 200px;
    height: 60px;
    overflow: visible;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .logo_black {
    width: 100%;
    height: 90%;
    object-fit: contain;
    display: block;
  }
  
  /* Notification Section */
  .notification-wrapper {
    position: relative;
    display: inline-block;
  }
  
  .notification-btn {
    height: 40px;
    width: 40px;
    color: white !important;
    background: transparent !important;
    border: none !important;
  }
  
  .notification-btn :deep(.v-icon) {
    color: white !important;
  }
  
  .notification-btn :deep(.v-btn__content) {
    color: white !important;
  }
  
  .custom-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background: #FF5252;
    color: white;
    border-radius: 50%;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    z-index: 1;
    line-height: 1;
  }
  
  /* User Menu Section */
  .right-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .user-menu {
    display: flex;
    align-items: center;
    gap:2px
  }
  
  .profile-wrapper {
    width: 68px;
    height: 45px;
    -webkit-border-radius: 800px;
    -moz-border-radius: 800px;
      border-radius: 800px;
     background: #000000 ;
     position: absolute;
     right: 2px;
  }
  .user-avatar {
    display: flex;
    width: 62px;
    height: 62px;
    padding: 0;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: #2196F3; /* Using design token */
    cursor: pointer;
  }
  
  .user-initial {
    color: white;
    font-size: 18px;
    font-weight: 500;
  }
  .user-menu-button {
    padding: 4px 8px !important;
    min-width: auto !important;
    height: auto !important;
    border-radius: 24px !important;
    background-color: #000000;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04) !important;
    }
  }
  
  .dropdown-icon {
    color: #FFFFFF;
    transition: transform 0.2s ease;
  }
  
  .user-menu-button[aria-expanded="true"] .dropdown-icon {
    transform: rotate(180deg);
  }
  
 
  .v-overlay__content.user-menu-overlay,
  .v-overlay__content.user-menu-overlay .v-list,
  .v-overlay__content.user-menu-overlay .v-sheet {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2) !important;
  }

 
  
  </style>
  