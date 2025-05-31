import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, Space, Breadcrumb, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { notificationInstance } from '../../services/api';
import './CategoryForm.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CategoryForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    setInitialLoading(true);
    try {
      const response = await categoryService.getCategory(id);
      if (response.success && response.data) {
        form.setFieldsValue(response.data);
      } else {
        notificationInstance.error({
          message: 'Category Not Found',
          description: 'The requested category could not be found in the system.',
          placement: 'topRight',
          duration: 4,
        });
        navigate('/dashboard/categories');
      }
    } catch (error) {
      notificationInstance.error({
        message: 'Failed to Load Category',
        description: 'Could not load category details. Please try again or contact support.',
        placement: 'topRight',
        duration: 4,
      });
      navigate('/dashboard/categories');
    } finally {
      setInitialLoading(false);
    }
  };

  const onFinish = async values => {
    setLoading(true);
    try {
      let response;

      if (isEditing) {
        response = await categoryService.updateCategory(id, values);
        if (response && response.success) {
          notificationInstance.success({
            message: 'Category Updated',
            description: 'The category has been successfully updated.',
            placement: 'topRight',
            duration: 4,
          });
          navigate('/dashboard/categories');
        } else {
          // Extract error message for validation errors
          let errorMessage = response?.message || 'Failed to update category. Please try again.';

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
        response = await categoryService.createCategory(values);
        if (response && response.success) {
          notificationInstance.success({
            message: 'Category Created',
            description: 'The new category has been successfully created.',
            placement: 'topRight',
            duration: 4,
          });
          navigate('/dashboard/categories');
        } else {
          // Extract error message for validation errors
          let errorMessage = response?.message || 'Failed to create category. Please try again.';

          if (response?.error?.details && response.error.details.length > 0) {
            // Get first validation error message
            errorMessage = response.error.details[0].message;
          } else if (response?.error?.message) {
            // Get general error message
            errorMessage = response.error.message;
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

      // Extract error message from response if available
      let errorMessage = `Failed to ${errorMsg} category`;

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

      notificationInstance.error({
        message: `Category ${isEditing ? 'Update' : 'Creation'} Failed`,
        description: errorMessage,
        placement: 'topRight',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = errorInfo => {
    console.error('Form validation failed:', errorInfo);
  };

  const handleCancel = () => {
    navigate('/dashboard/categories');
  };

  return (
    <div className="category-form-page">
      <div className="page-header">
        <Breadcrumb
          items={[
            { title: 'Dashboard' },
            { title: <a onClick={() => navigate('/dashboard/categories')}>Categories</a> },
            { title: isEditing ? 'Edit Category' : 'Add Category' },
          ]}
        />
        <Title level={2}>{isEditing ? 'Edit Category' : 'Add Category'}</Title>
        <Text type="secondary">
          {isEditing ? 'Update category information' : 'Create a new category'}
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
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Please enter the category name',
                },
              ]}
            >
              <Input placeholder="Enter category name" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <TextArea
                placeholder="Enter category description (optional)"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
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
    </div>
  );
};

export default CategoryForm;
