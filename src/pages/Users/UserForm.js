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
  Select,
  Divider,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../../services/userService';
import { notificationInstance } from '../../services/api';
import { ROLES } from '../../constants';
import './UserForm.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Password } = Input;

const UserForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    setInitialLoading(true);
    try {
      const response = await userService?.getUser(id);
      if (response?.success && response?.data) {
        // Set form values, but exclude password since we don't want to prefill it
        form.setFieldsValue({
          name: response?.data?.name,
          email: response?.data?.email,
          role: response?.data?.role,
        });
      } else {
        notificationInstance.error({
          message: 'User Not Found',
          description: 'The requested user could not be found in the system.',
          placement: 'topRight',
          duration: 4,
        });
        navigate('/dashboard/users');
      }
    } catch (error) {
      notificationInstance.error({
        message: 'Failed to Load User',
        description: 'Could not load user details. Please try again or contact support.',
        placement: 'topRight',
        duration: 4,
      });
      navigate('/dashboard/users');
    } finally {
      setInitialLoading(false);
    }
  };

  const onFinish = async values => {
    setLoading(true);
    try {
      let response;

      // For updates, only include password if it was provided
      if (isEditing) {
        const dataToUpdate = values.password ? values : { ...values, password: undefined };
        response = await userService.updateUser(id, dataToUpdate);
      } else {
        response = await userService.createUser(values);
      }

      if (response && response.success) {
        notificationInstance.success({
          message: `User ${isEditing ? 'Updated' : 'Created'}`,
          description: `The user has been successfully ${isEditing ? 'updated' : 'created'}.`,
          placement: 'topRight',
          duration: 4,
        });
        navigate('/dashboard/users');
      } else {
        // Extract error message for validation errors
        let errorMessage =
          response?.message ||
          `Failed to ${isEditing ? 'update' : 'create'} user. Please try again.`;

        if (response?.error?.details && response?.error?.details?.length > 0) {
          // Get first validation error message
          errorMessage = response?.error?.details[0]?.message;
        } else if (response?.error?.message) {
          // Get general error message
          errorMessage = response?.error?.message;
        }

        notificationInstance.error({
          message: `User ${isEditing ? 'Update' : 'Creation'} Failed`,
          description: errorMessage,
          placement: 'topRight',
          duration: 4,
        });
      }
    } catch (error) {
      const errorMsg = isEditing ? 'updating' : 'creating';

      // Extract error message from response if available
      let errorMessage = `Failed to ${errorMsg} user`;

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
        message: `User ${isEditing ? 'Update' : 'Creation'} Failed`,
        description: errorMessage,
        placement: 'topRight',
        duration: 4,
      });
      console.error(`Error ${errorMsg} user:`, error);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = errorInfo => {
    console.error('Form validation failed:', errorInfo);
  };

  const handleCancel = () => {
    navigate('/dashboard/users');
  };

  const passwordRules = isEditing
    ? [
        {
          min: 6,
          message: 'Password must be at least 6 characters',
        },
      ]
    : [
        {
          required: true,
          message: 'Please enter a password',
        },
        {
          min: 6,
          message: 'Password must be at least 6 characters',
        },
      ];

  return (
    <div className="user-form-page">
      <div className="page-header">
        <Breadcrumb
          items={[
            { title: 'Dashboard' },
            { title: <a onClick={() => navigate('/dashboard/users')}>Users</a> },
            { title: isEditing ? 'Edit User' : 'Add User' },
          ]}
        />
        <Title level={2}>{isEditing ? 'Edit User' : 'Add User'}</Title>
        <Text type="secondary">
          {isEditing ? 'Update user information' : 'Create a new user account'}
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
                  message: 'Please enter the user name',
                },
              ]}
            >
              <Input placeholder="Enter user name" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Please enter the email address',
                },
                {
                  type: 'email',
                  message: 'Please enter a valid email address',
                },
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>

            <Form.Item
              label="Role"
              name="role"
              rules={[
                {
                  required: true,
                  message: 'Please select a role',
                },
              ]}
            >
              <Select placeholder="Select user role">
                <Option value={ROLES.ADMIN}>Admin</Option>
                <Option value={ROLES.SALES}>Sales</Option>
              </Select>
            </Form.Item>

            <Divider />

            <Form.Item
              label={isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
              name="password"
              rules={passwordRules}
            >
              <Password placeholder={isEditing ? 'Enter new password' : 'Enter password'} />
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

export default UserForm;
