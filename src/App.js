import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, notification } from 'antd';
import { ROUTES, ROLES } from './constants';
import { notificationInstance } from './services/api';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/Login/LoginPage';
import CategoriesPage from './pages/Categories/CategoriesPage';
import CategoryForm from './pages/Categories/CategoryForm';
import ProductsPage from './pages/Products/ProductsPage';
import ProductForm from './pages/Products/ProductForm';
import UsersPage from './pages/Users/UsersPage';
import UserForm from './pages/Users/UserForm';

// Components
import AuthGuard from './components/AuthGuard';
import RoleGuard from './components/RoleGuard';

// Styles
import './styles/global.css';

// Theme
const theme = {
  token: {
    colorPrimary: '#1976d2',
    borderRadius: 4,
    fontFamily: 'Nunito Sans, sans-serif',
  },
};

function App() {
  const [notificationApi, contextHolder] = notification.useNotification();

  // Initialize the global notification instance when app loads
  useEffect(() => {
    notificationInstance.init(notificationApi);
  }, [notificationApi]);

  return (
    <ConfigProvider theme={theme}>
      {contextHolder}
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <AuthGuard>
                <DashboardLayout />
              </AuthGuard>
            }
          >
            {/* Redirect from /dashboard to /dashboard/products */}
            <Route index element={<Navigate to={ROUTES.PRODUCTS} replace />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/add" element={<CategoryForm />} />
            <Route path="categories/edit/:id" element={<CategoryForm />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/add" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />

            {/* Users Routes - Admin Only */}
            <Route
              path="users"
              element={
                <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                  <UsersPage />
                </RoleGuard>
              }
            />
            <Route
              path="users/add"
              element={
                <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                  <UserForm />
                </RoleGuard>
              }
            />
            <Route
              path="users/edit/:id"
              element={
                <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                  <UserForm />
                </RoleGuard>
              }
            />
          </Route>

          {/* Redirect / to login */}
          <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

          {/* Handle 404 - Redirect to Products */}
          <Route path="*" element={<Navigate to={ROUTES.PRODUCTS} replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
