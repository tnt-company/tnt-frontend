import api from './api';
import { API_BASE_URL } from '../constants';

export const productService = {
  // Get all products with pagination, search, and category filter
  getProducts: async (page = 1, search = '', categoryId = undefined) => {
    const params = { page };

    if (search) {
      params.search = search;
    }

    if (categoryId) {
      params.categoryId = categoryId;
    }

    const response = await api.get(`${API_BASE_URL}/products`, { params });
    return response.data;
  },

  // Get a single product by ID
  getProduct: async id => {
    try {
      const response = await api.get(`${API_BASE_URL}/products/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch product',
        error: error?.response?.data?.error || null,
      };
    }
  },

  // Create a new product (with multiple images)
  createProduct: async formData => {
    try {
      const response = await api.post(`${API_BASE_URL}/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to create product',
        error: error?.response?.data?.error || null,
      };
    }
  },

  // Update an existing product (with multiple images)
  updateProduct: async (id, formData) => {
    try {
      const response = await api.put(`${API_BASE_URL}/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to update product',
        error: error?.response?.data?.error || null,
      };
    }
  },

  // Delete a product
  deleteProduct: async id => {
    const response = await api.delete(`${API_BASE_URL}/products/${id}`);
    return response.data;
  },
};
