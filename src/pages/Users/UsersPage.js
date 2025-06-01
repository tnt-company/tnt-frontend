import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Popconfirm,
  Space,
  Typography,
  Breadcrumb,
  Tag,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { notificationInstance } from '../../services/api';
import { ITEMS_PER_PAGE, ROLES } from '../../constants';
import SearchInput from '../../components/SearchInput';
import './UsersPage.css';

const { Title } = Typography;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: ITEMS_PER_PAGE,
    total: 0,
    showSizeChanger: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const navigate = useNavigate();
  const isMobile = windowWidth <= 768;

  // Listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window?.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchUsers = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await userService.getUsers(page, search);
      setUsers(response?.data);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: response?.total * ITEMS_PER_PAGE, // Assuming 10 items per page
      }));
    } catch (error) {
      notificationInstance.error({
        message: 'Failed to Load Users',
        description: 'Could not retrieve user data. Please try again later.',
        placement: 'topRight',
        duration: 4,
      });
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, searchQuery);
  }, [searchQuery]);

  const handleTableChange = pagination => {
    fetchUsers(pagination?.current, searchQuery);
  };

  const handleSearch = useCallback(value => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page on search
  }, []);

  const handleDelete = async id => {
    try {
      await userService.deleteUser(id);
      notificationInstance.success({
        message: 'User Deleted',
        description: 'The user has been deleted successfully.',
        placement: 'topRight',
        duration: 4,
      });
      fetchUsers(pagination?.current, searchQuery);
    } catch (error) {
      notificationInstance.error({
        message: 'Delete Failed',
        description:
          error?.response?.data?.error?.message || 'Failed to delete the user. Please try again.',
        placement: 'topRight',
        duration: 4,
      });
    }
  };

  const getRoleLabel = roleId => {
    switch (roleId) {
      case ROLES.ADMIN:
        return <Tag color="blue">Admin</Tag>;
      case ROLES.SALES:
        return <Tag color="green">Sales</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: isMobile ? 150 : 200,
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: isMobile ? 200 : 300,
      ellipsis: true,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: isMobile ? 100 : 120,
      render: role => getRoleLabel(role),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: isMobile ? false : 'right',
      width: isMobile ? 100 : 120,
      render: (_, record) => (
        <Space size={isMobile ? 'small' : 'middle'}>
          <Button
            type="text"
            size={isMobile ? 'small' : 'middle'}
            icon={<EditOutlined />}
            onClick={() => navigate(`/dashboard/users/edit/${record.id}`)}
          />
          <Popconfirm
            title="Delete user?"
            description={isMobile ? null : 'Are you sure you want to delete this user?'}
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              size={isMobile ? 'small' : 'middle'}
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="users-page">
      <div className="page-header">
        <Breadcrumb items={[{ title: 'Dashboard' }, { title: 'Users' }]} />
        <Title level={2}>Users</Title>
      </div>

      <Row gutter={[16, 16]} className="table-actions-row">
        <Col xs={24} sm={12} md={16} lg={18}>
          <SearchInput
            placeholder="Search by name"
            onSearch={handleSearch}
            style={{ width: '100%', maxWidth: 400 }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} className="action-buttons">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/dashboard/users/add')}
          >
            Add User
          </Button>
        </Col>
      </Row>

      <Card className="table-card">
        <div className="responsive-table">
          <Table
            columns={columns}
            dataSource={users.map(user => ({ ...user, key: user.id }))}
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
            rowKey="id"
            scroll={{ x: 'max-content' }}
            size={isMobile ? 'small' : 'middle'}
            className="users-table"
          />
        </div>
      </Card>
    </div>
  );
};

export default UsersPage;
