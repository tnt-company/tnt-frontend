import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Button, Popconfirm, Space, Typography, Breadcrumb, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { notificationInstance } from '../../services/api';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import SearchInput from '../../components/SearchInput';
import CategoryFilter from '../../components/CategoryFilter';
import { ITEMS_PER_PAGE, ROLES } from '../../constants';
import './ProductsPage.css';

const { Title } = Typography;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: ITEMS_PER_PAGE,
    total: 0,
    showSizeChanger: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState(undefined);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewTitle, setPreviewTitle] = useState('');
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

  // Fetch products data
  const fetchProducts = async (page = 1, search = '', categoryFilter = undefined) => {
    setLoading(true);
    try {
      const response = await productService.getProducts(page, search, categoryFilter);
      setProducts(response?.data);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: response?.total * ITEMS_PER_PAGE, // Assuming 10 items per page
      }));
    } catch (error) {
      notificationInstance.error({
        message: 'Failed to Load Products',
        description: 'Could not retrieve products. Please try again later.',
        placement: 'topRight',
        duration: 4,
      });
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for lookup and filter
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories(1, '', 'false');
      setCategories(response?.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(1, searchQuery, categoryId);
  }, [searchQuery, categoryId]);

  const handleTableChange = pagination => {
    fetchProducts(pagination?.current, searchQuery, categoryId);
  };

  const handleSearch = useCallback(value => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page on search
  }, []);

  const handleCategoryChange = useCallback(value => {
    setCategoryId(value);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page on category change
  }, []);

  const handleDelete = async id => {
    try {
      await productService.deleteProduct(id);
      notificationInstance.success({
        message: 'Product Deleted',
        description: 'The product has been deleted successfully.',
        placement: 'topRight',
        duration: 4,
      });
      fetchProducts(pagination.current, searchQuery, categoryId);
    } catch (error) {
      notificationInstance.error({
        message: 'Delete Failed',
        description:
          error?.response?.data?.error?.message ||
          'Failed to delete the product. Please try again.',
        placement: 'topRight',
        duration: 4,
      });
      console.error('Error deleting product:', error);
    }
  };

  const handlePreview = useCallback(record => {
    // Handle both old API (single imageUrl) and new API (imageUrls array)
    const images = [];

    // Check if record has imageUrl (legacy support)
    if (record?.imageUrl) {
      images.push(record?.imageUrl);
    }

    // Check if record has imageUrls array
    if (record?.imageUrls && Array.isArray(record?.imageUrls) && record?.imageUrls?.length > 0) {
      images.push(...record.imageUrls);
    }

    // For backward compatibility, also check if there's an images array
    if (record?.images && Array.isArray(record?.images) && record?.images?.length > 0) {
      images.push(...record.images);
    }

    setPreviewImages(images);
    setPreviewTitle(record?.name);
    setPreviewVisible(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewVisible(false);
  }, []);

  // Define columns - all columns will be shown but with responsive widths
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: isMobile ? 150 : 200,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: 'Price',
      dataIndex: 'salesPrice',
      key: 'salesPrice',
      width: isMobile ? 100 : 120,
      render: price => `₹${parseFloat(price).toFixed(2)}`,
    },
    ...(isAdmin
      ? [
          {
            title: 'Cost Price',
            dataIndex: 'costPrice',
            key: 'costPrice',
            width: isMobile ? 100 : 120,
            render: price => `₹${parseFloat(price).toFixed(2)}`,
          },
        ]
      : []),
    {
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'category',
      width: isMobile ? 120 : 150,
      render: categoryId => {
        const category = categories?.find(cat => cat?.id === categoryId);
        return category ? category?.name : categoryId;
      },
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'image',
      width: isMobile ? 80 : 100,
      render: (_, record) => {
        // Determine if the product has any images
        const hasImages =
          (record?.imageUrl && record?.imageUrl?.trim() !== '') ||
          (record?.imageUrls &&
            Array.isArray(record?.imageUrls) &&
            record?.imageUrls?.length > 0) ||
          (record?.images && Array.isArray(record?.images) && record?.images?.length > 0);

        return (
          <Button
            type="link"
            size={isMobile ? 'small' : 'middle'}
            onClick={() => handlePreview(record)}
            icon={<EyeOutlined />}
            disabled={!hasImages}
          >
            {!isMobile && (hasImages ? 'View' : 'No Image')}
          </Button>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: isMobile ? 150 : 250,
      ellipsis: true,
    },
    ...(isAdmin
      ? [
          {
            title: 'Actions',
            key: 'actions',
            width: isMobile ? 100 : 120,
            render: (_, record) => (
              <Space size={isMobile ? 'small' : 'middle'}>
                <Button
                  type="text"
                  size={isMobile ? 'small' : 'middle'}
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/dashboard/products/edit/${record.id}`)}
                />
                <Popconfirm
                  title="Delete product?"
                  description={isMobile ? null : 'Are you sure you want to delete this product?'}
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
        ]
      : []),
  ];

  return (
    <div className="products-page">
      <div className="page-header">
        <Breadcrumb items={[{ title: 'Dashboard' }, { title: 'Products' }]} />
        <Title level={2}>Products</Title>
      </div>

      <Row gutter={[16, 16]} className="table-actions-row">
        <Col xs={24} sm={12} md={8} lg={8}>
          <SearchInput
            placeholder="Search by name"
            onSearch={handleSearch}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={8}>
          <CategoryFilter
            categories={categories}
            onChange={handleCategoryChange}
            value={categoryId}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} className="action-buttons">
          {isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/dashboard/products/add')}
            >
              Add Product
            </Button>
          )}
        </Col>
      </Row>

      <Card className="table-card">
        <div className="responsive-table">
          <Table
            columns={columns}
            dataSource={products.map(product => ({ ...product, key: product.id }))}
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
            rowKey="id"
            scroll={{ x: 'max-content' }}
            size={isMobile ? 'small' : 'middle'}
            className="products-table"
          />
        </div>
      </Card>

      <ImagePreviewModal
        visible={previewVisible}
        imageUrls={previewImages}
        onClose={handleClosePreview}
        title={previewTitle}
      />
    </div>
  );
};

export default ProductsPage;
