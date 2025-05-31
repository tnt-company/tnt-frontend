import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { notificationInstance } from '../../services/api';
import { ROUTES } from '../../constants';

const { Title } = Typography;

const ChangePasswordPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async values => {
    const { oldPassword, newPassword, confirmPassword } = values;

    setLoading(true);
    try {
      const response = await authService.changePassword(oldPassword, newPassword, confirmPassword);

      if (response.success) {
        notificationInstance.success({
          message: 'Success',
          description: response.message,
          placement: 'topRight',
          duration: 4,
        });
        navigate(ROUTES.DASHBOARD);
      } else {
        // Handle validation errors or other error responses
        let errorMessage = 'Password change failed';

        if (response?.error?.details && response?.error?.details?.length > 0) {
          // Get first validation error message
          errorMessage = response?.error?.details[0]?.message;
        } else if (response?.error?.message) {
          // Get general error message
          errorMessage = response?.error?.message;
        } else if (response?.message) {
          // Fallback to general message
          errorMessage = response?.message;
        }

        notificationInstance.error({
          message: 'Error',
          description: errorMessage,
          placement: 'topRight',
          duration: 4,
        });
      }
    } catch (error) {
      // Handle unexpected errors
      let errorMessage = 'An unexpected error occurred';

      if (error?.response?.data?.error?.details && error.response.data.error.details.length > 0) {
        // Get first validation error message from axios error
        errorMessage = error?.response?.data?.error?.details[0]?.message;
      } else if (error?.response?.data?.error?.message) {
        // Get general error message
        errorMessage = error?.response?.data?.error?.message;
      } else if (error?.response?.data?.message) {
        // Fallback to general message
        errorMessage = error?.response?.data?.message;
      }

      notificationInstance.error({
        message: 'Error',
        description: errorMessage,
        placement: 'topRight',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center">
      <Col xs={24} sm={20} md={16} lg={12} xl={8}>
        <Card className="form-card">
          <Title level={2} className="text-center">
            Change Password
          </Title>
          <Form form={form} name="change_password" layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="oldPassword"
              label="Current Password"
              rules={[
                {
                  required: true,
                  message: 'Please input your current password',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Current Password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                {
                  required: true,
                  message: 'Please input your new password',
                },
                {
                  min: 6,
                  message: 'Password must be at least 6 characters',
                },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="New Password" size="large" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={['newPassword']}
              rules={[
                {
                  required: true,
                  message: 'Please confirm your new password',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('The two passwords that you entered do not match')
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm New Password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default ChangePasswordPage;
