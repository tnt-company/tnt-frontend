import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Breadcrumb,
  Spin,
  InputNumber,
  Select,
  Upload,
  Modal,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { S3_BASE_URL, MAX_PRODUCT_IMAGES } from '../../constants';
import { notificationInstance } from '../../services/api';
import './ProductForm.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProductForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Fetch categories for the dropdown
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories(1, '', 'false');
      setCategories(response.data);
    } catch (error) {
      notificationInstance.error({
        message: 'Failed to Load Categories',
        description: 'Could not retrieve product categories. Please try again later.',
        placement: 'topRight',
        duration: 4,
      });
    }
  };

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setInitialLoading(true);
    try {
      const response = await productService.getProduct(id);

      if (response?.success && response?.data) {
        // Set form values
        form.setFieldsValue({
          name: response?.data?.name,
          description: response?.data?.description,
          categoryId: response?.data?.categoryId,
          salesPrice: parseFloat(response?.data?.salesPrice),
          costPrice: parseFloat(response?.data?.costPrice),
        });

        // Process image URLs
        const images = [];

        // Legacy support - single imageUrl
        if (response?.data?.imageUrl && response?.data?.imageUrl?.trim()) {
          const fullUrl = response?.data?.imageUrl?.startsWith('http')
            ? response?.data?.imageUrl
            : `${S3_BASE_URL}${response?.data?.imageUrl}`;

          const filename = response?.data?.imageUrl?.split('/').pop();

          images.push({
            url: fullUrl,
            path: response?.data?.imageUrl,
            name: filename,
          });
        }

        // Support for imageUrls array
        if (response?.data?.imageUrls && Array.isArray(response?.data?.imageUrls)) {
          response?.data?.imageUrls?.forEach(imgUrl => {
            if (imgUrl && imgUrl.trim()) {
              const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${S3_BASE_URL}${imgUrl}`;

              // Extract the actual filename from the path
              const filename = imgUrl.split('/').pop();

              images.push({
                url: fullUrl,
                path: imgUrl,
                name: filename,
              });
            }
          });
        }

        // Support for images array
        if (response?.data?.images && Array.isArray(response?.data?.images)) {
          response?.data?.images?.forEach(imgUrl => {
            if (imgUrl && imgUrl.trim()) {
              const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${S3_BASE_URL}${imgUrl}`;

              // Extract the actual filename from the path
              const filename = imgUrl.split('/').pop();

              images.push({
                url: fullUrl,
                path: imgUrl,
                name: filename,
              });
            }
          });
        }

        setExistingImages(images);
      } else {
        notificationInstance.error({
          message: 'Product Not Found',
          description: 'The requested product could not be found in the system.',
          placement: 'topRight',
          duration: 4,
        });
        navigate('/dashboard/products');
      }
    } catch (error) {
      notificationInstance.error({
        message: 'Failed to Load Product',
        description: 'Could not load product details. Please try again or contact support.',
        placement: 'topRight',
        duration: 4,
      });
      navigate('/dashboard/products');
    } finally {
      setInitialLoading(false);
    }
  };

  const onFinish = async values => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData?.append('name', values?.name);
      formData?.append('description', values?.description || '');
      formData?.append('categoryId', values?.categoryId || '');
      formData?.append('salesPrice', values?.salesPrice);
      formData?.append('costPrice', values?.costPrice);

      // First, add new uploaded files
      newImages?.forEach(file => {
        if (file?.originFileObj) {
          formData?.append('images', file?.originFileObj);
        }
      });

      // Then, download and add existing images
      for (const img of existingImages) {
        try {
          const imgResponse = await fetch(img?.url, {
            headers: {
              'cache-control': 'no-cache',
            },
          });
          if (!imgResponse.ok) continue;

          const blob = await imgResponse?.blob();
          const filename = img?.name || 'image.jpg';
          const file = new File([blob], filename, { type: blob?.type || 'image/jpeg' });

          formData?.append('images', file);
        } catch (error) {
          console.error('Error processing image:', img?.url, error);
        }
      }

      let response;
      if (isEditing) {
        response = await productService?.updateProduct(id, formData);
        if (response && response?.success) {
          notificationInstance.success({
            message: 'Product Updated',
            description: 'The product has been successfully updated in the system.',
            placement: 'topRight',
            duration: 4,
          });
          navigate('/dashboard/products');
        } else {
          // Extract error message for validation errors
          let errorMessage = response?.message || 'Failed to update product. Please try again.';

          if (response?.error?.details && response?.error?.details?.length > 0) {
            // Get first validation error message
            errorMessage = response?.error?.details[0]?.message;
          } else if (response?.error?.message) {
            // Get general error message
            errorMessage = response?.error?.message;
          }

          notificationInstance.error({
            message: 'Update Failed',
            description: errorMessage,
            placement: 'topRight',
            duration: 4,
          });
        }
      } else {
        response = await productService?.createProduct(formData);
        if (response && response?.success) {
          notificationInstance.success({
            message: 'Product Created',
            description: 'The new product has been successfully created.',
            placement: 'topRight',
            duration: 4,
          });
          navigate('/dashboard/products');
        } else {
          // Extract error message for validation errors
          let errorMessage = response?.message || 'Failed to create product. Please try again.';

          if (response?.error?.details && response?.error?.details?.length > 0) {
            // Get first validation error message
            errorMessage = response?.error?.details[0]?.message;
          } else if (response?.error?.message) {
            // Get general error message
            errorMessage = response?.error?.message;
          }

          notificationInstance.error({
            message: 'Creation Failed',
            description: errorMessage,
            placement: 'topRight',
            duration: 4,
          });
        }
      }
    } catch (error) {
      const errorMsg = isEditing ? 'updating' : 'creating';
      console.error(`Error ${errorMsg} product:`, error);

      // Extract error message from response if available
      let errorMessage = `Failed to ${errorMsg} product`;

      if (
        error?.response?.data?.error?.details &&
        error?.response?.data?.error?.details?.length > 0
      ) {
        // Get first validation error message
        errorMessage = error?.response?.data?.error?.details[0]?.message;
      } else if (error?.response?.data?.error?.message) {
        // Get general error message
        errorMessage = error?.response?.data?.error?.message;
      } else if (error?.response?.data?.message) {
        // Fallback to general message
        errorMessage = error?.response?.data?.message;
      }

      // Use notification directly to ensure message is displayed
      notificationInstance.error({
        message: `Product ${isEditing ? 'Update' : 'Creation'} Failed`,
        description: errorMessage,
        placement: 'topRight',
        duration: 6,
        key: 'product-operation-error',
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = errorInfo => {
    console.error('Form validation failed:', errorInfo);
  };

  const handleCancel = () => {
    navigate('/dashboard/products');
  };

  // Handle file uploads
  const handleFileUpload = e => {
    if (Array.isArray(e)) {
      return e;
    }
    const newFiles = e && e.fileList ? [...e.fileList] : [];
    setNewImages(newFiles);
    return newFiles;
  };

  // Preview image
  const handlePreview = (url, name) => {
    setPreviewImage(url);
    setPreviewVisible(true);
    setPreviewTitle(name);
  };

  // Remove existing image
  const handleRemoveExistingImage = indexToRemove => {
    setExistingImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const totalImages = existingImages?.length + newImages?.length;
  const canAddMoreImages = totalImages < MAX_PRODUCT_IMAGES;

  // Check file type and size before upload
  const beforeUpload = file => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      notificationInstance.error({
        message: 'Invalid File Format',
        description: 'You can only upload image files.',
        placement: 'topRight',
        duration: 4,
      });
      return Upload.LIST_IGNORE;
    }

    const isLessThan5MB = file.size / 1024 / 1024 < 5;
    if (!isLessThan5MB) {
      notificationInstance.error({
        message: 'File Too Large',
        description: 'Image must be smaller than 5MB.',
        placement: 'topRight',
        duration: 4,
      });
      return Upload.LIST_IGNORE;
    }

    return false; // Return false to prevent auto upload
  };

  return (
    <div className="product-form-page">
      <div className="page-header">
        <Breadcrumb
          items={[
            { title: 'Dashboard' },
            { title: <a onClick={() => navigate('/dashboard/products')}>Products</a> },
            { title: isEditing ? 'Edit Product' : 'Add Product' },
          ]}
        />
        <Title level={2}>{isEditing ? 'Edit Product' : 'Add Product'}</Title>
        <Text type="secondary">
          {isEditing ? 'Update product information' : 'Create a new product'}
        </Text>
      </div>

      <Card className="form-card">
        {initialLoading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            encType="multipart/form-data"
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please enter the product name' }]}
            >
              <Input placeholder="Enter product name" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <TextArea
                placeholder="Enter product description (optional)"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Form.Item>

            <Form.Item
              label="Category"
              name="categoryId"
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select
                placeholder="Select a category"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                optionFilterProp="children"
                getPopupContainer={trigger => trigger.parentNode}
              >
                {categories?.map(category => (
                  <Option key={category?.id} value={category?.id}>
                    {category?.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Sales Price"
              name="salesPrice"
              rules={[{ required: true, message: 'Please enter the sales price' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                prefix="₹"
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              label="Cost Price"
              name="costPrice"
              rules={[{ required: true, message: 'Please enter the cost price' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                prefix="₹"
                placeholder="0.00"
              />
            </Form.Item>

            {/* Existing Images Section */}
            {existingImages.length > 0 && (
              <Form.Item
                label={
                  <span>
                    Current Images
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      (Click to preview, delete to remove)
                    </Text>
                  </span>
                }
              >
                <Row gutter={[16, 16]} className="existing-images-grid">
                  {existingImages?.map((image, index) => (
                    <Col key={index} xs={12} sm={8} md={6} lg={4}>
                      <div className="existing-image-item">
                        <div
                          className="image-preview-wrapper"
                          onClick={() => handlePreview(image?.url, image?.name)}
                        >
                          <img src={image?.url} alt={image?.name} className="image-thumbnail" />
                          <div className="image-hover-overlay">
                            <EyeOutlined />
                          </div>
                        </div>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveExistingImage(index)}
                          className="delete-image-btn"
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              </Form.Item>
            )}

            {/* New Images Upload */}
            <Form.Item
              label={
                <span>
                  Add Images ({totalImages}/{MAX_PRODUCT_IMAGES})
                </span>
              }
              name="new_images"
              valuePropName="fileList"
              getValueFromEvent={handleFileUpload}
              extra={`You can upload up to ${MAX_PRODUCT_IMAGES} images (max 5MB each, image formats only). ${
                canAddMoreImages
                  ? `${MAX_PRODUCT_IMAGES - totalImages} slots remaining.`
                  : 'Maximum limit reached.'
              }`}
            >
              <Upload
                listType="picture-card"
                fileList={newImages}
                beforeUpload={beforeUpload}
                multiple={true}
                maxCount={MAX_PRODUCT_IMAGES - existingImages?.length}
                disabled={!canAddMoreImages}
                onPreview={file =>
                  handlePreview(URL.createObjectURL(file?.originFileObj), file?.name)
                }
              >
                {canAddMoreImages && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {isEditing ? 'Update' : 'Create'}
                </Button>
                <Button onClick={handleCancel}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Card>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title={null}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        centered
        width="auto"
        className="image-preview-modal"
      >
        <img
          alt={previewTitle}
          style={{ maxWidth: '100%', maxHeight: '80vh' }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

export default ProductForm;
