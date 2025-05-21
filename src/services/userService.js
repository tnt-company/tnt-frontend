import api from './api';
import { API_BASE_URL } from '../constants';

export const userService = {
  // Get all users with pagination and search
  getUsers: async (page = 1, search = '') => {
    const response = await api.get(`${API_BASE_URL}/users/others`, {
      params: { page, search },
    });
    return response.data;
  },

  // Get a single user by ID
  getUser: async id => {
    const response = await api.get(`${API_BASE_URL}/users/${id}`);
    return response.data;
  },

  // Create a new user
  createUser: async userData => {
    const response = await api.post(`${API_BASE_URL}/users`, userData);
    return response.data;
  },

  // Update an existing user
  updateUser: async (id, userData) => {
    const response = await api.put(`${API_BASE_URL}/users/${id}`, userData);
    return response.data;
  },

  // Delete a user
  deleteUser: async id => {
    const response = await api.delete(`${API_BASE_URL}/users/${id}`);
    return response.data;
  },
};
