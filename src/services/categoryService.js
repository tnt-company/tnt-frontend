import api from './api';
import { API_BASE_URL } from '../constants';

export const categoryService = {
  // Get all categories with pagination and search
  getCategories: async (page = 1, search = '') => {
    const response = await api.get(`${API_BASE_URL}/categories`, {
      params: { page, search },
    });
    return response.data;
  },

  // Get a single category by ID
  getCategory: async id => {
    const response = await api.get(`${API_BASE_URL}/categories/${id}`);
    return response.data;
  },

  // Create a new category
  createCategory: async data => {
    const response = await api.post(`${API_BASE_URL}/categories`, data);
    return response.data;
  },

  // Update an existing category
  updateCategory: async (id, data) => {
    const response = await api.put(`${API_BASE_URL}/categories/${id}`, data);
    return response.data;
  },

  // Delete a category
  deleteCategory: async id => {
    const response = await api.delete(`${API_BASE_URL}/categories/${id}`);
    return response.data;
  },
};
