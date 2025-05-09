import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '../../store';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../services/api.js';
import './index.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  // 处理登录
  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await userApi.login({
        adminName: values.username,
        adminPassword: values.password,
      });
      
      if (response && response.success && response.data && response.data.access_token) {
        const { access_token, adminId } = response.data;
        
        try {
          const adminInfoResponse = await userApi.getAdminInfo(adminId);
          if (adminInfoResponse && adminInfoResponse.success && adminInfoResponse.data) {
            const adminData = adminInfoResponse.data;
            dispatch(loginAction({ 
              ...adminData, 
              access_token 
            }));
            message.success(response.message || '登录成功');
            navigate('/dashboard');
          } else {
            const { access_token, ...userData } = response.data;
            dispatch(loginAction({ ...userData, access_token }));
            message.success(response.message || '登录成功，但获取详细信息失败');
            navigate('/dashboard');
          }
        } catch (detailError) {
          console.error('获取管理员详情失败:', detailError);
          const { access_token, ...userData } = response.data;
          dispatch(loginAction({ ...userData, access_token }));
          message.success(response.message || '登录成功，但获取详细信息失败');
          navigate('/dashboard');
        }
      } else {
        message.error(response?.message || '登录失败，请检查用户名或密码');
      }
    } catch (error) {
      console.error('Login failed:', error);
      message.error(error?.response?.data?.message || '登录请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const response = await userApi.register({
        adminName: values.username,
        adminPassword: values.password,
        adminPasswordConfirm: values.confirmPassword,
      });
      
      if (response && response.success) {
        message.success('注册成功，请登录');
        setActiveTab('login');
        registerForm.resetFields();
        loginForm.setFieldsValue({ username: values.username });
      } else {
        message.error(response?.message || '注册失败');
      }
    } catch (error) {
      console.error('Register failed:', error);
      message.error(error?.response?.data?.message || '注册请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form
          form={loginForm}
          name="login"
          className="login-form"
          onFinish={handleLogin}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form
          form={registerForm}
          name="register"
          className="login-form"
          onFinish={handleRegister}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 4, message: '用户名至少4个字符!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码至少6个字符!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" loading={loading}>
              注册
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="login-container">
      <Card className="login-card" title="审核管理系统">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          centered
        />
      </Card>
    </div>
  );
};

export default Login;