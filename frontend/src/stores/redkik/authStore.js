import { defineStore } from 'pinia';
import { FEATURE_FLAG_DEFAULT_VALUES } from '@/utility/redkik/featureFlags';
import { authAPI } from '@/services/redkik/api';
import logger from '@/utility/redkik/logger.js';
import { useUserStore } from '@/stores/userStore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    featureFlags: null,
    // Session management
    sessionStartTime: null,
    lastActivityTime: null,
    tokenExpirationTime: null,
  }),

  actions: {
   
    async login(credentials) {
      try {
       
        const result = await authAPI.login(credentials);
        
        if (!result.success || result.error) {
          logger.error('[AUTH STORE] Login failed:', result.error);
          return { 
            success: false, 
            error: result.error || { 
              error: 'invalid_grant',
              error_description: 'Login failed. Please check your credentials.'
            }
          };
        }
        
    
        if (!result.data) {
          logger.error('[AUTH STORE] Login response missing data');
          return { 
            success: false, 
            error: { 
              error: 'invalid_response',
              error_description: 'Invalid login response: missing data'
            } 
          };
        }
        
        // Extract tokens from response
        const { access_token, refresh_token } = result.data;
        
        // CRITICAL: Validate that we actually received an access token
        // If there's no access_token, this is NOT a successful login
        if (!access_token || typeof access_token !== 'string' || access_token.trim().length === 0) {
          logger.error('[AUTH STORE] Missing or invalid access_token in response:', {
            hasAccessToken: !!access_token,
            accessTokenType: typeof access_token,
            accessTokenLength: access_token ? access_token.length : 0,
            responseData: result.data
          });
          return { 
            success: false, 
            error: { 
              error: 'invalid_response',
              error_description: 'Invalid login response: missing or invalid access token'
            } 
          };
        }
        
        // Log successful authentication
        logger.debug('[AUTH STORE] Login successful, setting auth state:', { 
          hasAccessToken: !!access_token, 
          hasRefreshToken: !!refresh_token,
          responseKeys: Object.keys(result.data || {})
        });
        
        // Store tokens first so we can use them for API calls
        this.token = access_token;
        this.refreshToken = refresh_token || null;
        sessionStorage.setItem('token', access_token);
        if (refresh_token) {
          sessionStorage.setItem('refreshToken', refresh_token);
        }
        
        // Fetch user from GET /api/v2/user/users using email to get the actual ID
        const userEmail = credentials.email;
        let userData = null;
        try {
          logger.debug('[AUTH STORE] Fetching user from GET /api/v2/user/users for email:', userEmail);
          const userResult = await authAPI.getUserByEmail(userEmail);
          if (userResult.success && userResult.data) {
            userData = userResult.data;
            logger.debug('[AUTH STORE] User fetched successfully with ID:', userData.id);
          } else {
            logger.warn('[AUTH STORE] Failed to fetch user from API:', userResult.error);
          }
        } catch (error) {
          logger.warn('[AUTH STORE] Error fetching user from API:', error.message);
        }
        
        // Create user object with fetched data or fallback
        this.isAuthenticated = true;
        this.user = {
          id: userData?.id || null,
          externalId: userData?.externalId || null,
          email: userData?.email || userEmail,
          name: userData?.name || userEmail.split('@')[0] || 'User',
          role: userData?.role || 'user',
          agentCode: userData?.agentCode || userEmail,
          type: userData?.type || 'user',
          ...(userData || {}) // Include any other user properties from API
        };
        
        // Store token expiration time
        const { getTokenExpiration } = await import('@/utils/tokenUtils.js');
        this.tokenExpirationTime = getTokenExpiration(access_token);
        
        // Store user in sessionStorage
        sessionStorage.setItem('user', JSON.stringify(this.user));

        // Mirror token + user for router / userStore (uses auth_token + user in localStorage)
        localStorage.setItem('auth_token', access_token);
        localStorage.setItem('user', JSON.stringify(this.user));
        useUserStore().syncAuthTokenFromStorage();

        // Clear old localStorage keys (migration cleanup)
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Set session start time
        this.sessionStartTime = Date.now();
        this.lastActivityTime = Date.now();
        
        logger.debug('[AUTH STORE] Auth state set successfully:', { 
          isAuthenticated: this.isAuthenticated, 
          hasToken: !!this.token, 
          hasUser: !!this.user,
          userId: this.user.id
        });
        
        return { success: true, data: result.data };
      } catch (error) {
        logger.error('[AUTH STORE] Login exception:', error);
        return { 
          success: false, 
          error: { 
            error: 'server_error',
            error_description: error.message || 'Login failed. Please try again.',
            status: 500
          } 
        };
      }
    },

    /**
     * Logout user and clear session
     * @returns {Promise<Object>} Logout result
     */
    async logout() {
      try {
        // Call API logout endpoint
        const result = await authAPI.logout();
        
        // Clear local state regardless of API response
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        this.refreshToken = null;
        this.featureFlags = null;
        this.sessionStartTime = null;
        this.lastActivityTime = null;
        this.tokenExpirationTime = null;
        
        // Clear sessionStorage
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        
        // Clear localStorage (for other data)
        localStorage.removeItem('permissionsList');
        localStorage.removeItem('isDataPrivacyNoticeAgreed');
        localStorage.removeItem('featureFlags');

        // Also clear old localStorage tokens if they exist (migration cleanup)
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        
        return { success: true, data: result.data };
      } catch (error) {
        logger.error('Logout error:', error);
        // Still clear local state even if API call fails
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        this.refreshToken = null;
        this.featureFlags = null;
        this.sessionStartTime = null;
        this.lastActivityTime = null;
        this.tokenExpirationTime = null;
        
        // Clear all storage
        sessionStorage.clear();
        localStorage.clear();
        
        return { 
          success: false, 
          error: { message: 'Logout completed locally' } 
        };
      }
    },

    getFeatureFlagsValue(featureFlag) {
      const featureFlagsData = JSON.parse(localStorage.getItem('featureFlags'));
      if (!featureFlagsData) {
        return FEATURE_FLAG_DEFAULT_VALUES.HIDDEN;
      }
      return featureFlagsData[featureFlag].defaultValue.value;
    },
    getPermissionsList() {
      return JSON.parse(localStorage.getItem('permissionsList'));
    },

    getUserDetails() {
      // Try sessionStorage first, fallback to localStorage for migration
      const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    },
    
    /**
     * Check if token is expired
     * @returns {boolean} True if token is expired
     */
    async isTokenExpired() {
      if (!this.token) {
        return true;
      }
      const { isTokenExpired } = await import('@/utils/tokenUtils.js');
      return isTokenExpired(this.token);
    },
    
    /**
     * Check if token should be refreshed
     * @param {number} bufferMinutes - Minutes before expiration to refresh (default: 5)
     * @returns {Promise<boolean>} True if token should be refreshed
     */
    async shouldRefreshToken(bufferMinutes = 5) {
      if (!this.token) {
        return false;
      }
      const { isTokenNearExpiration } = await import('@/utils/tokenUtils.js');
      return isTokenNearExpiration(this.token, bufferMinutes);
    },
    
    /**
     * Get token expiration time
     * @returns {Promise<number|null>} Expiration timestamp in milliseconds or null
     */
    async getTokenExpiration() {
      if (!this.token) {
        return null;
      }
      const { getTokenExpiration } = await import('@/utils/tokenUtils.js');
      return getTokenExpiration(this.token);
    },
    
    /**
     * Update last activity time
     */
    updateActivityTime() {
      this.lastActivityTime = Date.now();
    },
    setFeatureFlags(featureFlags) {
      localStorage.setItem('featureFlags', JSON.stringify(featureFlags));
      this.featureFlags = featureFlags;
    },
    setPermissionsList(permissionsList) {
      localStorage.setItem('permissionsList', JSON.stringify(permissionsList));
    },

    /**
     * Check if a permission exists in the permissions list
     * @param {string} permission - The permission to check (e.g., 'clients.list', 'quotation.create')
     * @returns {boolean} - True if permission exists, false otherwise
     */
    hasPermission(permission) {
      try {
        const permissionsList = this.getPermissionsList();

        // If no permissions list exists, return false
        if (!permissionsList || !Array.isArray(permissionsList)) {
          return false;
        }

        // Check if the permission exists in the list
        return permissionsList.includes(permission);
      } catch (error) {
        logger.error('Error checking permission:', error);
        return false;
      }
    },

    async initialize() {
      // Migrate from localStorage to sessionStorage if needed
      const localToken = localStorage.getItem('token');
      const localUser = localStorage.getItem('user');
      const localRefreshToken = localStorage.getItem('refreshToken');
      
      if (localToken && localUser) {
        // Migrate to sessionStorage
        sessionStorage.setItem('token', localToken);
        sessionStorage.setItem('user', localUser);
        if (localRefreshToken) {
          sessionStorage.setItem('refreshToken', localRefreshToken);
        }
        
        // Clear localStorage tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }

      // Load from sessionStorage
      const token = sessionStorage.getItem('token');
      const user = sessionStorage.getItem('user');
      const refreshToken = sessionStorage.getItem('refreshToken');

      if (token && user) {
        // Check if token is expired
        const { isTokenExpired, getTokenExpiration } = await import('@/utils/tokenUtils.js');
        
        if (!isTokenExpired(token)) {
          this.isAuthenticated = true;
          this.token = token;
          this.user = JSON.parse(user);
          this.refreshToken = refreshToken;
          this.tokenExpirationTime = getTokenExpiration(token);
          
          // Restore session times if available
          const sessionStart = sessionStorage.getItem('sessionStartTime');
          const lastActivity = sessionStorage.getItem('lastActivityTime');
          if (sessionStart) {
            this.sessionStartTime = parseInt(sessionStart, 10);
          }
          if (lastActivity) {
            this.lastActivityTime = parseInt(lastActivity, 10);
          }
        } else {
          // Token expired - clear storage
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('sessionStartTime');
          sessionStorage.removeItem('lastActivityTime');
        }
      }
    },

    // Check if user is currently authenticated
    isLoggedIn() {
      return this.isAuthenticated && !!this.token;
    },
  },
});