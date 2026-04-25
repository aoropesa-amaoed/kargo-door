import api, { CLIENT_ID, CLIENT_SECRET } from './index.js';
import logger from '@/utility/redkik/logger.js';

/**
 * Authentication API Service
 */
export const authAPI = {
  /**
   * User login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Login result
   */
  async login(credentials) {
    try {
      logger.apiRequest('POST', '/api/v2/user/oauth/token', {
        grant_type: 'password',
        email: credentials.email,
        password: '***',
        client_id: CLIENT_ID
      });

      const requestPayload = {
        grant_type: 'password',
        client_id: CLIENT_ID,
        email: credentials.email,
        password: credentials.password
      };

      const response = await api.post('/api/v2/user/oauth/token', requestPayload);
      const responseData = response.data;
      const responseStatus = response.status;

      if (responseData && (responseData.error || responseData.error_description)) {
        logger.apiError('POST', '/api/v2/user/oauth/token', {
          response: {
            status: responseStatus,
            data: responseData
          }
        });
        
        return {
          success: false,
          error: {
            error: responseData.error || 'invalid_grant',
            error_description: responseData.error_description || responseData.message || 'Invalid email or password.',
            status: responseStatus === 200 ? 401 : responseStatus
          }
        };
      }

      if (!responseData || !responseData.access_token) {
        return {
          success: false,
          error: {
            error: 'invalid_response',
            error_description: 'Invalid login response: missing access token',
            status: responseStatus
          }
        };
      }

      logger.apiResponse('POST', '/api/v2/user/oauth/token', responseData);
      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      logger.apiError('POST', '/api/v2/user/oauth/token', error);
      
      const errorData = error.response?.data;
      const status = error.response?.status;
      
      if (errorData && (errorData.error || errorData.error_description)) {
        return {
          success: false,
          error: {
            error: errorData.error || 'invalid_grant',
            error_description: errorData.error_description || errorData.message || 'Invalid email or password.',
            status: status || 401
          }
        };
      }
      
      if (status === 401) {
        return {
          success: false,
          error: {
            error: 'invalid_grant',
            error_description: 'Invalid email or password.',
            status: 401
          }
        };
      }
      
      return {
        success: false,
        error: errorData || { 
          error: 'server_error',
          error_description: error.message || 'Login failed. Please try again.',
          status: status || 500
        }
      };
    }
  },

  /**
   * User logout
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      const response = await api.post('/api/v2/user/oauth/logout', {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Logout failed' },
      };
    }
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Token refresh response
   */
  async refreshToken(refreshToken) {
    try {
      const response = await api.post('/api/v2/user/oauth/token', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Token refresh failed' },
      };
    }
  },

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User data response
   */
  async getUserByEmail(email) {
    try {
      logger.apiRequest('GET', `/api/v2/user/users?email=${encodeURIComponent(email)}`);
      
      const response = await api.get(`/api/v2/user/users`, {
        params: { email }
      });
      
      logger.apiResponse('GET', `/api/v2/user/users?email=${email}`, response.data);
      
      const users = response.data?.data || response.data;
      const userArray = Array.isArray(users) ? users : (users?.users || []);
      const foundUser = userArray.find(u => 
        u.email && u.email.toLowerCase() === email.toLowerCase()
      ) || userArray[0];
      
      return {
        success: true,
        data: foundUser || null,
      };
    } catch (error) {
      logger.apiError('GET', `/api/v2/user/users?email=${email}`, error);
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to fetch user by email' },
      };
    }
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data response
   */
  async getUserById(userId) {
    try {
      logger.apiRequest('GET', `/api/v2/user/users/${userId}`);
      
      const response = await api.get(`/api/v2/user/users/${userId}`);
      
      logger.apiResponse('GET', `/api/v2/user/users/${userId}`, response.data);
      
      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      logger.apiError('GET', `/api/v2/user/users/${userId}`, error);
      return {
        success: false,
        error: error.response?.data || { message: 'Failed to fetch user details' },
      };
    }
  },
};