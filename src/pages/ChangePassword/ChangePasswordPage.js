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
        notificationInstance.error({
          message: 'Error',
          description: response.message,
          placement: 'topRight',
          duration: 4,
        });
      }
    } catch (error) {
      notificationInstance.error({
        message: 'Error',
        description: 'An unexpected error occurred',
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
