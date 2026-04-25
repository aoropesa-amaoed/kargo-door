
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/redkik/authStore';
import logger from '@/utility/redkik/logger.js';

/**
 * Session Management Composable
 * Handles session timeout, activity tracking, and session lifecycle
 */
export function useSession() {
  const router = useRouter();
  const authStore = useAuthStore();
  
  // Session configuration
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiration
  
  // Session state
  const sessionStartTime = ref(null);
  const lastActivityTime = ref(null);
  const sessionTimeoutId = ref(null);
  const tokenRefreshIntervalId = ref(null);
  const isSessionActive = ref(false);
  
  // BroadcastChannel for cross-tab synchronization
  let broadcastChannel = null;
  
  /**
   * Initialize BroadcastChannel for cross-tab communication
   */
  const initBroadcastChannel = () => {
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel('session-sync');
      
      // Listen for session events from other tabs
      broadcastChannel.onmessage = (event) => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'LOGIN':
            // Another tab logged in - restore session
            if (!authStore.isAuthenticated) {
              authStore.initialize();
              startSession();
            }
            break;
          case 'LOGOUT':
            // Another tab logged out - clear session
            clearSession();
            router.push('/login');
            break;
          case 'ACTIVITY':
            // Another tab reported activity - update last activity time
            if (isSessionActive.value) {
              lastActivityTime.value = data.timestamp;
              resetSessionTimeout();
            }
            break;
          case 'SESSION_EXPIRED':
            // Another tab detected session expiration
            clearSession();
            router.push('/login');
            break;
        }
      };
    }
  };
  
  /**
   * Broadcast session event to other tabs
   */
  const broadcastSessionEvent = (type, data = {}) => {
    if (broadcastChannel) {
      try {
        // Check if channel is still open before posting
        // readyState: 'connecting' (0), 'open' (1), 'closing' (2), 'closed' (3)
        if (broadcastChannel.readyState === 'open' || broadcastChannel.readyState === 1) {
          broadcastChannel.postMessage({ type, data });
        }
      } catch (error) {
        // Silently ignore errors if channel is closed
        // This can happen during component unmount
        logger.debug('BroadcastChannel error (likely closed):', error.message);
      }
    }
  };
  
  /**
   * Check if session is valid
   */
  const checkSession = () => {
    if (!authStore.isAuthenticated || !authStore.token) {
      return false;
    }
    
    // Check if session timeout has been reached
    if (lastActivityTime.value) {
      const timeSinceLastActivity = Date.now() - lastActivityTime.value;
      if (timeSinceLastActivity >= SESSION_TIMEOUT) {
        return false;
      }
    }
    
    return true;
  };
  
  /**
   * Start session tracking
   */
  const startSession = () => {
    if (isSessionActive.value) {
      return; // Session already active
    }
    
    const now = Date.now();
    sessionStartTime.value = now;
    lastActivityTime.value = now;
    isSessionActive.value = true;
    
    // Store in sessionStorage for persistence
    sessionStorage.setItem('sessionStartTime', now.toString());
    sessionStorage.setItem('lastActivityTime', now.toString());
    
    // Broadcast login event to other tabs
    broadcastSessionEvent('LOGIN', {
      timestamp: now
    });
    
    // Start session timeout monitoring
    resetSessionTimeout();
    
    // Start token refresh monitoring
    startTokenRefreshMonitoring();
  };
  
  /**
   * Reset session timeout timer
   */
  const resetSessionTimeout = () => {
    // Clear existing timeout
    if (sessionTimeoutId.value) {
      clearTimeout(sessionTimeoutId.value);
    }
    
    // Set new timeout
    sessionTimeoutId.value = setTimeout(() => {
      handleSessionTimeout();
    }, SESSION_TIMEOUT);
  };
  
  /**
   * Handle session timeout
   */
  const handleSessionTimeout = () => {
   
    
    // Broadcast session expired event
    broadcastSessionEvent('SESSION_EXPIRED');
    
    // Clear session and logout
    clearSession();
    
    // Redirect to login
    router.push('/login');
  };
  
  /**
   * Extend session on user activity
   */
  const extendSession = () => {
    if (!isSessionActive.value) {
      return;
    }
    
    const now = Date.now();
    lastActivityTime.value = now;
    
    // Store in sessionStorage for persistence across page reloads
    sessionStorage.setItem('lastActivityTime', now.toString());
    if (sessionStartTime.value) {
      sessionStorage.setItem('sessionStartTime', sessionStartTime.value.toString());
    }
    
    // Broadcast activity to other tabs
    broadcastSessionEvent('ACTIVITY', {
      timestamp: now
    });
    
    // Reset timeout
    resetSessionTimeout();
  };
  
  /**
   * Start token refresh monitoring
   */
  const startTokenRefreshMonitoring = () => {
    // Clear existing interval
    if (tokenRefreshIntervalId.value) {
      clearInterval(tokenRefreshIntervalId.value);
    }
    
    // Check token expiration every minute
    tokenRefreshIntervalId.value = setInterval(() => {
      checkAndRefreshToken();
    }, 60 * 1000); // Check every minute
  };
  
  /**
   * Check token expiration and refresh if needed
   */
  const checkAndRefreshToken = async () => {
    if (!authStore.token || !authStore.refreshToken) {
      return;
    }
    
    // Import token utils dynamically to avoid circular dependency
    const { isTokenExpired, getTokenExpiration } = await import('@/utils/tokenUtils.js');
    
    if (isTokenExpired(authStore.token)) {
      // Token already expired - logout
      
      clearSession();
      router.push('/login');
      return;
    }
    
    // Check if token needs refresh (within buffer time)
    const expirationTime = getTokenExpiration(authStore.token);
    if (expirationTime) {
      const timeUntilExpiration = expirationTime - Date.now();
      if (timeUntilExpiration <= TOKEN_REFRESH_BUFFER) {
        // Token needs refresh
        await refreshToken();
      }
    }
  };
  
  /**
   * Refresh access token
   */
  const refreshToken = async () => {
    if (!authStore.refreshToken) {
      logger.error('No refresh token available');
      return false;
    }
    
    try {
      const { authAPI } = await import('@/services/api.js');
      const result = await authAPI.refreshToken(authStore.refreshToken);
      
      if (result.success && result.data.access_token) {
        // Update tokens in store
        authStore.token = result.data.access_token;
        if (result.data.refresh_token) {
          authStore.refreshToken = result.data.refresh_token;
        }
        
        // Update sessionStorage
        sessionStorage.setItem('token', result.data.access_token);
        if (result.data.refresh_token) {
          sessionStorage.setItem('refreshToken', result.data.refresh_token);
        }
        
       
        return true;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      logger.error('Token refresh error:', error);
      // Auto-logout on refresh failure
      clearSession();
      router.push('/login');
      return false;
    }
  };
  
  /**
   * Clear session and cleanup
   */
  const clearSession = () => {
    isSessionActive.value = false;
    sessionStartTime.value = null;
    lastActivityTime.value = null;
    
    // Clear sessionStorage session data
    sessionStorage.removeItem('sessionStartTime');
    sessionStorage.removeItem('lastActivityTime');
    
    // Clear timeouts
    if (sessionTimeoutId.value) {
      clearTimeout(sessionTimeoutId.value);
      sessionTimeoutId.value = null;
    }
    
    if (tokenRefreshIntervalId.value) {
      clearInterval(tokenRefreshIntervalId.value);
      tokenRefreshIntervalId.value = null;
    }

    // Broadcast logout event
    broadcastSessionEvent('LOGOUT');
  };
  
  /**
   * Get session status
   */
  const getSessionStatus = computed(() => {
    return {
      isActive: isSessionActive.value,
      startTime: sessionStartTime.value,
      lastActivity: lastActivityTime.value,
      timeRemaining: lastActivityTime.value 
        ? Math.max(0, SESSION_TIMEOUT - (Date.now() - lastActivityTime.value))
        : 0
    };
  });
  
  // Initialize BroadcastChannel on mount
  onMounted(() => {
    initBroadcastChannel();
  });
  
  // Cleanup on unmount
  onUnmounted(() => {
    // Clear session first (before closing channel) to avoid broadcast errors
    clearSession();
    // Then close the channel
    if (broadcastChannel) {
      broadcastChannel.close();
      broadcastChannel = null;
    }
  });
  
  return {
    // State
    isSessionActive,
    sessionStartTime,
    lastActivityTime,
    getSessionStatus,
    
    // Methods
    startSession,
    extendSession,
    clearSession,
    checkSession,
    refreshToken,
    resetSessionTimeout,
  };
}
