import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';
import { notification } from 'antd';

// Create a singleton notification instance that can be used across the app
export const notificationInstance = {
  instance: null,
  init(api) {
    this.instance = api;
  },
  error(config) {
    if (this.instance) {
      this.instance.error(config);
    } else {
      // Fallback to regular notification if context holder not initialized
      notification.error(config);
    }
  },
  success(config) {
    if (this.instance) {
      this.instance.success(config);
    } else {
      notification.success(config);
    }
  },
  warning(config) {
    if (this.instance) {
      this.instance.warning(config);
    } else {
      notification.warning(config);
    }
  },
  info(config) {
    if (this.instance) {
      this.instance.info(config);
    } else {
      notification.info(config);
    }
  },
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    notificationInstance.error({
      message: 'Connection Error',
      description: 'Network error. Please check your connection.',
      duration: 4,
      placement: 'topRight',
      key: 'api-request-error',
    });
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle different error scenarios
    if (!error.response) {
      // Network error
      notificationInstance.error({
        message: 'Network Error',
        description: 'Network error. Please check your connection.',
        duration: 4,
        placement: 'topRight',
        key: 'network-error',
      });
    } else if (error.response.status === 401 || error.response.status === 403) {
      if (!error.config.url.includes('/login')) {
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);

        // Redirect to login page - use a timeout to ensure message is seen
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
