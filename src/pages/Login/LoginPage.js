import React, { useEffect } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../store/authSlice';
import { APP_NAME, ROUTES } from '../../constants';
import './LoginPage.css';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // If user is already authenticated, redirect to products
    if (isAuthenticated) {
      navigate(ROUTES.PRODUCTS);
    }
  }, [isAuthenticated, navigate]);

  const onFinish = values => {
    dispatch(loginUser(values));
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <div className="login-logo">
          <h1>{APP_NAME}</h1>
          <p>Administration Panel</p>
        </div>

        <div className="login-title">
          <h2>Login to your account</h2>
        </div>

        {error && (
          <Alert
            message="Login Failed"
            description={error}
            type="error"
            showIcon
            className="login-error"
          />
        )}

        <Form name="login_form" initialValues={{ remember: true }} onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: 'Please input your Email!',
              },
              {
                type: 'email',
                message: 'Please enter a valid email address',
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your Password!',
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              loading={loading}
              size="large"
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
