import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Button, Popconfirm, Space, Typography, Breadcrumb, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { categoryService } from '../../services/categoryService';
import { notificationInstance } from '../../services/api';
import { ITEMS_PER_PAGE, ROLES } from '../../constants';
import SearchInput from '../../components/SearchInput';
import './CategoriesPage.css';

const { Title } = Typography;

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
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
  const { user } = useSelector(state => state.auth);
  const isAdmin = user?.role === ROLES.ADMIN;
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

  const fetchCategories = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories(page, search);
      setCategories(response?.data);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: response?.total * ITEMS_PER_PAGE, // Assuming 10 items per page
      }));
    } catch (error) {
      notificationInstance.error({
        message: 'Failed to Load Categories',
        description: 'Could not retrieve categories. Please try again later.',
        placement: 'topRight',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1, searchQuery);
  }, [searchQuery]);

  const handleTableChange = pagination => {
    fetchCategories(pagination?.current, searchQuery);
  };

  const handleSearch = useCallback(value => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page on search
  }, []);

  const handleDelete = async id => {
    try {
      await categoryService.deleteCategory(id);
      notificationInstance.success({
        message: 'Category Deleted',
        description: 'The category has been deleted successfully.',
        placement: 'topRight',
        duration: 4,
      });
      fetchCategories(pagination?.current, searchQuery);
    } catch (error) {
      notificationInstance.error({
        message: 'Delete Failed',
        description:
          error?.response?.data?.error?.message ||
          'Failed to delete the category. Please try again.',
        placement: 'topRight',
        duration: 4,
      });
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: isMobile ? 150 : 250,
      ellipsis: true,
    },
  ];

  // Add Actions column only for admin users
  if (isAdmin) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      width: isMobile ? 100 : 120,
      fixed: isMobile ? false : 'right',
      render: (_, record) => (
        <Space size={isMobile ? 'small' : 'middle'}>
          <Button
            type="text"
            size={isMobile ? 'small' : 'middle'}
            icon={<EditOutlined />}
            onClick={() => navigate(`/dashboard/categories/edit/${record.id}`)}
          />
          <Popconfirm
            title="Delete this category?"
            description={
              isMobile
                ? null
                : 'Are you sure you want to delete this category? This action cannot be undone.'
            }
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
    });
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <Breadcrumb items={[{ title: 'Dashboard' }, { title: 'Categories' }]} />
        <Title level={2}>Categories</Title>
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
          {isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/dashboard/categories/add')}
            >
              Add Category
            </Button>
          )}
        </Col>
      </Row>

      <Card className="table-card">
        <div className="responsive-table">
          <Table
            columns={columns}
            dataSource={categories.map(cat => ({ ...cat, key: cat.id }))}
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
            rowKey="id"
            scroll={{ x: 'max-content' }}
            size={isMobile ? 'small' : 'middle'}
            className="categories-table"
          />
        </div>
      </Card>
    </div>
  );
};

export default CategoriesPage;
