import axios from 'axios';
import logger from '@/utility/redkik/logger.js';


const API_BASE_URL = import.meta.env.VITE_API_URL;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

if (!API_BASE_URL) {
    throw new Error('VITE_API_URL must be set in environment variables');
}
if (!CLIENT_ID) {
    throw new Error('VITE_CLIENT_ID must be set in environment variables');
}

const axiosBaseURL =
    import.meta.env.DEV && API_BASE_URL ? '/redkik' : API_BASE_URL;

const api = axios.create({
    baseURL: axiosBaseURL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(
    async (config) => {
        let token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (token) {
            const { isTokenNearExpiration, isTokenExpired } = await import('@/utils/tokenUtils.js');
            if (isTokenExpired(token)) {
                const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
                if (refreshToken && !isRefreshing) {
                    isRefreshing = true;
                    try {
                        const {authAPI} = await import('./auth.js');
                        const refreshResult = await authAPI.refreshToken(refreshToken);
                        if (refreshResult.success && refreshResult.data.access_token) {
                            token = refreshResult.data.access_token;
                            sessionStorage.setItem('token', token);
                            if (refreshResult.data.refresh_token) {
                                sessionStorage.setItem('refreshToken', refreshResult.data.refresh_token);
                            }
                            localStorage.removeItem('token');
                            localStorage.removeItem('refreshToken');
                            processQueue(null, token);
                        } else {
                            throw new Error('Token refresh failed');
                        }
                    } catch (error) {
                        processQueue(error, null);
                        sessionStorage.clear();
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                        return Promise.reject(error);
                    } finally {
                        isRefreshing = false;
                    }
                }
            }
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor for error handling and token refresh
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
      logger.apiError(
        error.config?.method?.toUpperCase() || 'UNKNOWN',
        error.config?.url || 'UNKNOWN',
        error
      );
  
      const originalRequest = error.config;
  
      if (error.response?.status === 401 && !originalRequest._retry) {
        const isTokenEndpoint = error.config?.url?.includes('/oauth/token');
        
        if (isTokenEndpoint) {
          const requestData = error.config?.data;
          let grantType = null;
          
          if (typeof requestData === 'string') {
            try {
              const parsed = JSON.parse(requestData);
              grantType = parsed.grant_type;
            } catch {
              const params = new URLSearchParams(requestData);
              grantType = params.get('grant_type');
            }
          } else if (requestData && typeof requestData === 'object') {
            grantType = requestData.grant_type;
          }
          
          if (grantType === 'password' || grantType === 'refresh_token') {
            return Promise.reject(error);
          }
        }
        
        if (originalRequest._retry) {
          return Promise.reject(error);
        }
        
        originalRequest._retry = true;
        const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
        
        if (refreshToken && !isRefreshing) {
          isRefreshing = true;
          
          try {
            const { authAPI } = await import('./auth.js');
            const refreshResult = await authAPI.refreshToken(refreshToken);
            
            if (refreshResult.success && refreshResult.data.access_token) {
              const newToken = refreshResult.data.access_token;
              sessionStorage.setItem('token', newToken);
              if (refreshResult.data.refresh_token) {
                sessionStorage.setItem('refreshToken', refreshResult.data.refresh_token);
              }
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              processQueue(null, newToken);
              return api(originalRequest);
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            processQueue(refreshError, null);
            sessionStorage.clear();
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          return Promise.reject(error);
        }
      }
  
      return Promise.reject(error);
    }
  );
  
  export { API_BASE_URL, CLIENT_ID, CLIENT_SECRET };
  export default api;