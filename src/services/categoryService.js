import api from './api';
import { API_BASE_URL } from '../constants';

export const categoryService = {
  // Get all categories with pagination and search
  getCategories: async (page = 1, search = '', pagination = 'true') => {
    const response = await api.get(`${API_BASE_URL}/categories`, {
      params: { page, search, pagination },
    });
    return response.data;
  },

  // Get a single category by ID
  getCategory: async id => {
    try {
      const response = await api.get(`${API_BASE_URL}/categories/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch category',
        error: error?.response?.data?.error || null,
      };
    }
  },

  // Create a new category
  createCategory: async data => {
    try {
      const response = await api.post(`${API_BASE_URL}/categories`, data);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to create category',
        error: error?.response?.data?.error || null,
      };
    }
  },

  // Update an existing category
  updateCategory: async (id, data) => {
    try {
      const response = await api.put(`${API_BASE_URL}/categories/${id}`, data);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to update category',
        error: error?.response?.data?.error || null,
      };
    }
  },

  // Delete a category
  deleteCategory: async id => {
    const response = await api.delete(`${API_BASE_URL}/categories/${id}`);
    return response.data;
  },
};
