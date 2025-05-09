import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, theme, Modal, Descriptions, Tag, Button, Form, Input, Select, message } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store';
import { userApi } from '../../services/api';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  AuditOutlined,
  LogoutOutlined,
  EditOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return ['dashboard'];
    if (path.includes('/reviews')) return ['reviews'];
    return ['dashboard'];
  };

  // 菜单项点击事件
  const handleMenuClick = ({ key }) => {
    navigate(`/${key}`);
  };

  // 处理用户头像点击
  const handleUserClick = () => {
    setUserModalVisible(true);
  };

  // 处理退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  // 处理编辑按钮点击
  const handleEditClick = () => {
    form.setFieldsValue({
      adminName: user?.adminName,
      adminAuth: user?.adminAuth,
      adminPassword: '',
    });
    setEditModalVisible(true);
  };

  // 处理编辑表单提交
  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const response = await userApi.updateAdmin(user?.adminId, values);
      
      if (response && response.success) {
        message.success('更新成功');
        // 更新 Redux 中的用户信息
        dispatch(setUser({
          ...user,
          ...values,
        }));
        setEditModalVisible(false);
        setUserModalVisible(false);
      } else {
        message.error(response?.message || '更新失败');
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      message.error(error?.response?.data?.message || '更新失败，请稍后重试');
    }
  };

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          padding: 0,
          background: colorBgContainer,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px',
          position: 'fixed',
          zIndex: 1,
          width: '100%',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            marginLeft: '20px', 
            marginRight: '20px', 
            fontSize: '18px', 
            fontWeight: 'bold' 
          }}>
            审核管理系统
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={getSelectedKey()}
            onClick={handleMenuClick}
            style={{ lineHeight: '64px', border: 'none' }}
            items={[
              {
                key: 'dashboard',
                icon: <DashboardOutlined />,
                label: '仪表盘',
              },
              {
                key: 'reviews',
                icon: <AuditOutlined />,
                label: '审核管理',
              },
            ]}
          />
        </div>
        <div style={{ marginRight: 24 }}>
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={handleUserClick}
          >
            <Avatar icon={<UserOutlined />} />
            <span style={{ marginLeft: 8 }}>{user?.adminName || '管理员'}</span>
          </div>
        </div>
      </Header>

      {/* 用户信息弹窗 */}
      <Modal
        title="用户信息"
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={[
          <Button 
            key="edit" 
            type="primary" 
            icon={<EditOutlined />}
            onClick={handleEditClick}
          >
            修改信息
          </Button>,
          <Button 
            key="logout" 
            type="primary" 
            danger 
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            退出登录
          </Button>
        ]}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="用户名">{user?.adminName}</Descriptions.Item>
          <Descriptions.Item label="权限">
            {user?.adminAuth === 0 ? (
              <Tag color="blue">审核人员</Tag>
            ) : user?.adminAuth === 1 ? (
              <Tag color="green">管理人员</Tag>
            ) : (
              <Tag color="default">未知权限</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      {/* 编辑用户信息弹窗 */}
      <Modal
        title="修改用户信息"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="adminName"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 4, message: '用户名至少4个字符' }
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="adminAuth"
            label="权限"
            rules={[{ required: true, message: '请选择权限' }]}
          >
            <Select placeholder="请选择权限">
              <Option value={0}>审核人员</Option>
              <Option value={1}>管理人员</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="adminPassword"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
        </Form>
      </Modal>

      <Layout style={{ marginTop: 64 }}>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;