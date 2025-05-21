import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
  ShoppingOutlined,
  AppstoreOutlined,
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { ROLES } from '../../constants';

const DashboardPage = () => {
  const { user } = useSelector(state => state.auth);
  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}!</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Products" value={isAdmin ? 128 : 57} prefix={<ShoppingOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Categories" value={isAdmin ? 24 : 12} prefix={<AppstoreOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Customers" value={isAdmin ? 845 : '--'} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={isAdmin ? 15420 : 8750}
              prefix={<DollarOutlined />}
              suffix="$"
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Getting Started">
            <p>
              Welcome to the TNT dashboard! Please use the sidebar menu to navigate through
              different sections of the application.
            </p>
            <ul style={{ marginTop: 16, paddingLeft: 24 }}>
              <li>View and manage products in the Products section</li>
              <li>Organize your product categories in the Categories section</li>
              {isAdmin && (
                <>
                  <li>Monitor sales and revenue statistics</li>
                  <li>Manage user accounts and permissions</li>
                </>
              )}
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
