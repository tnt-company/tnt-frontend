import api from './api';
import { LOGIN_URL, CHANGE_PASSWORD_URL, STORAGE_KEYS } from '../constants';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post(LOGIN_URL, { email, password });

      if (response.data.success) {
        const { token, ...userData } = response.data.data;

        // Store token and user data in localStorage
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

        return { success: true, data: userData };
      } else {
        return { success: false, message: 'Login failed' };
      }
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.error?.message || error?.response?.data?.message || 'Login failed',
      };
    }
  },

  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.post(CHANGE_PASSWORD_URL, {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      return {
        success: response.data.success,
        message: response.data.message || 'Password changed successfully',
      };
    } catch (error) {
      // Handle the error structure properly
      return {
        success: false,
        message: error?.response?.data?.message || 'Password change failed',
        error: error?.response?.data?.error || null,
      };
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  },
};
