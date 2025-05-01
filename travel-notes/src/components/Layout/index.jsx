import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  AuditOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return ['dashboard'];
    if (path.includes('/users')) return ['users'];
    if (path.includes('/reviews')) return ['reviews'];
    return ['dashboard'];
  };

  // 菜单项点击事件
  const handleMenuClick = ({ key }) => {
    navigate(`/${key}`);
  };

  // 用户菜单项
  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      // 清除登录信息
      localStorage.removeItem('token');
      navigate('/login');
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
                key: 'users',
                icon: <UserOutlined />,
                label: '用户管理',
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
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleUserMenuClick,
            }}
            placement="bottomRight"
          >
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>管理员</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      <Content
        style={{
          margin: '88px 16px 24px',
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
};

export default MainLayout;