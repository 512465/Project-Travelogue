import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../services/api.js'; // 引入 userApi
import './index.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 处理登录
  const handleLogin = async (values) => {
    setLoading(true);
    try {
      // 将表单字段名映射到 API 期望的字段名
      const apiPayload = {
        adminName: values.username, // 更新字段名为 adminName
        adminPassword: values.password, // 更新字段名为 adminPassword
      };
      const response = await userApi.login(apiPayload); // 调用实际的登录 API
      console.log('Login response:', response); // 打印 API 响应
      // 根据新的响应体结构检查登录是否成功并获取 token
      if (response && response.success && response.data && response.data.access_token) {
        // 保存登录状态
        console.log('Login successful, token:', response.data.access_token);
        localStorage.setItem('token', response.data.access_token);
        message.success(response.message || '登录成功'); // 使用 API 返回的 message
        navigate('/dashboard'); // 登录成功后跳转到仪表盘
      } else {
        // 处理 API 返回但登录失败的情况 (e.g., success: false, or missing token)
        message.error(response?.message || '登录失败，请检查用户名或密码');
      }
    } catch (error) {
      // 处理 API 请求错误
      console.error('Login failed:', error);
      message.error(error?.response?.data?.message || '登录请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="审核管理系统登录">
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={handleLogin}
        >
          <Form.Item
            name="username" // 保持表单项 name 不变，仅修改提交时的字段名
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名 (admin)" />
          </Form.Item>
          <Form.Item
            name="password" // 保持表单项 name 不变，仅修改提交时的字段名
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="密码 (admin)"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;