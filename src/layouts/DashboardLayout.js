import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import { Outlet, Link } from 'react-router-dom';
import {
  DesktopOutlined,
  ShoppingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { ROUTES, APP_NAME, ROLES } from '../constants';
import './DashboardLayout.css';

const { Header, Sider, Content, Footer } = Layout;

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const isAdmin = user?.role === ROLES.ADMIN;

  // Set initial collapsed state based on screen width
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Update collapsed state on window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick = () => {
    // Close sidebar on menu click in mobile view
    if (isMobile) {
      setCollapsed(true);
    }
  };

  const userMenuItems = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        onClick: handleLogout,
      },
    ],
  };

  const sideMenuItems = [
    {
      key: ROUTES.CATEGORIES,
      icon: <DesktopOutlined />,
      label: (
        <Link to={ROUTES.CATEGORIES} onClick={() => handleMenuClick(ROUTES.CATEGORIES)}>
          Categories
        </Link>
      ),
    },
    {
      key: ROUTES.PRODUCTS,
      icon: <ShoppingOutlined />,
      label: (
        <Link to={ROUTES.PRODUCTS} onClick={() => handleMenuClick(ROUTES.PRODUCTS)}>
          Products
        </Link>
      ),
    },
    // Only show Users menu item for admin users
    ...(isAdmin
      ? [
          {
            key: ROUTES.USERS,
            icon: <TeamOutlined />,
            label: (
              <Link to={ROUTES.USERS} onClick={() => handleMenuClick(ROUTES.USERS)}>
                Users
              </Link>
            ),
          },
        ]
      : []),
  ];

  return (
    <Layout className="dashboard-layout">
      <Sider
        width={250}
        theme="light"
        collapsed={collapsed}
        collapsedWidth={0}
        trigger={null}
        className="sidebar"
        style={{
          position: 'fixed',
          height: '100vh',
          zIndex: 1000,
          left: 0,
          top: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <div className="sidebar-logo">
          <Link
            to={ROUTES.DASHBOARD}
            className="logo"
            onClick={() => handleMenuClick(ROUTES.DASHBOARD)}
          >
            {APP_NAME}
          </Link>
          {isMobile && (
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={toggleSidebar}
              className="sidebar-close"
            />
          )}
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={[window.location.pathname]}
          style={{ height: 'calc(100% - 64px)', borderRight: 0 }}
          items={sideMenuItems}
        />
      </Sider>
      <Layout className="site-layout" style={{ marginLeft: collapsed ? 0 : isMobile ? 0 : 250 }}>
        <Header className="dashboard-header">
          <div className="header-left">
            {(isMobile || collapsed) && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={toggleSidebar}
                className="menu-trigger"
              />
            )}
            <h3 className="header-title">{APP_NAME} Dashboard</h3>
          </div>
          <div className="header-right">
            <Dropdown menu={userMenuItems} placement="bottomRight">
              <div className="user-dropdown">
                <span className="user-dropdown-name">{user?.name || 'User'}</span>
                <Avatar icon={<UserOutlined />} />
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="dashboard-content">
          <div className="content-container">
            <Outlet />
          </div>
        </Content>
        <Footer className="dashboard-footer">
          {APP_NAME} © {new Date().getFullYear()} - All Rights Reserved
        </Footer>
      </Layout>
      {!collapsed && isMobile && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 999,
          }}
        />
      )}
    </Layout>
  );
};

export default DashboardLayout;
