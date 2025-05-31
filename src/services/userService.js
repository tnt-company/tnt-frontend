import api from './api';
import { API_BASE_URL } from '../constants';

export const userService = {
  // Get all users with pagination and search
  getUsers: async (page = 1, search = '') => {
    try {
      const response = await api.get(`${API_BASE_URL}/users/others`, {
        params: { page, search },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch users',
        error: error?.response?.data?.error || null,
      };
    }
  },

  // Get a single user by ID
  getUser: async id => {
    try {
      const response = await api.get(`${API_BASE_URL}/users/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch user',
        error: error?.response?.data?.error || null,
      };
    }
  },

  // Create a new user
  createUser: async userData => {
    try {
      const response = await api.post(`${API_BASE_URL}/users`, userData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to create user',
        error: error?.response?.data?.error || null,
      };
    }
  },

  // Update an existing user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`${API_BASE_URL}/users/${id}`, userData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to update user',
        error: error?.response?.data?.error || null,
      };
    }
  },

  // Delete a user
  deleteUser: async id => {
    try {
      const response = await api.delete(`${API_BASE_URL}/users/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete user',
        error: error?.response?.data?.error || null,
      };
    }
  },
};
