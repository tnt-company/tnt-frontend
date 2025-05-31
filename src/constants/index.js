// API URLs
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
export const LOGIN_URL = `${API_BASE_URL}/auth/login`;
export const CHANGE_PASSWORD_URL = `${API_BASE_URL}/auth/change-password`;

// S3 URL
export const S3_BASE_URL =
  process.env.REACT_APP_S3_BASE_URL || 'https://tnt-local.s3.us-east-1.amazonaws.com/';

// Frontend Routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CATEGORIES: '/dashboard/categories',
  PRODUCTS: '/dashboard/products',
  USERS: '/dashboard/users',
  CHANGE_PASSWORD: '/dashboard/change-password',
};

// User Roles
export const ROLES = {
  ADMIN: 1,
  SALES: 2,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'tnt_token',
  USER: 'tnt_user',
};

// App Constants
export const APP_NAME = 'TNT';
export const MAX_PRODUCT_IMAGES = 10;
