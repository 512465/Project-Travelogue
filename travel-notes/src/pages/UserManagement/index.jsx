import { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Typography, Tag, Modal, Form, message } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [form] = Form.useForm();

  // 模拟获取用户数据
  useEffect(() => {
    // 模拟API请求
    setTimeout(() => {
      const mockUsers = [
        {
          id: 'USER-001',
          name: '张三',
          phone: '13812345678',
          email: 'zhangsan@example.com',
          registerTime: '2022-05-10',
          level: '黄金会员',
          status: 1,
        },
        {
          id: 'USER-002',
          name: '李四',
          phone: '13987654321',
          email: 'lisi@example.com',
          registerTime: '2022-06-15',
          level: '白银会员',
          status: 1,
        },
        {
          id: 'USER-003',
          name: '王五',
          phone: '13700001111',
          email: 'wangwu@example.com',
          registerTime: '2022-07-20',
          level: '普通会员',
          status: 0,
        },
        {
          id: 'USER-004',
          name: '赵六',
          phone: '13622223333',
          email: 'zhaoliu@example.com',
          registerTime: '2022-08-25',
          level: '钻石会员',
          status: 1,
        },
        {
          id: 'USER-005',
          name: '钱七',
          phone: '13944445555',
          email: 'qianqi@example.com',
          registerTime: '2022-09-30',
          level: '白银会员',
          status: 1,
        },
      ];
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  // 处理添加用户
  const handleAdd = () => {
    setModalTitle('添加用户');
    setCurrentUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑用户
  const handleEdit = (user) => {
    setModalTitle('编辑用户');
    setCurrentUser(user);
    form.setFieldsValue({
      name: user.name,
      phone: user.phone,
      email: user.email,
      level: user.level,
      status: user.status,
    });
    setModalVisible(true);
  };

  // 处理删除用户
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      onOk: () => {
        setUsers(users.filter((user) => user.id !== id));
        message.success('删除成功');
      },
    });
  };

  // 处理表单提交
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (currentUser) {
        // 编辑用户
        const updatedUsers = users.map((user) =>
          user.id === currentUser.id ? { ...user, ...values } : user
        );
        setUsers(updatedUsers);
        message.success('更新成功');
      } else {
        // 添加用户
        const newUser = {
          id: `USER-${String(users.length + 1).padStart(3, '0')}`,
          registerTime: new Date().toISOString().split('T')[0],
          ...values,
        };
        setUsers([...users, newUser]);
        message.success('添加成功');
      }
      setModalVisible(false);
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '注册时间',
      dataIndex: 'registerTime',
      key: 'registerTime',
      width: 150,
      sorter: (a, b) => new Date(a.registerTime) - new Date(b.registerTime),
    },
    {
      title: '会员等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        if (status === 1) {
          return <Tag color="green">正常</Tag>;
        } else {
          return <Tag color="red">禁用</Tag>;
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', padding: '20px', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>用户管理</Title>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleAdd}
        >
          添加用户
        </Button>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input
          placeholder="搜索用户名/手机号/邮箱"
          prefix={<SearchOutlined />}
          style={{ width: 250 }}
        />
        <Select placeholder="会员等级" style={{ width: 120 }}>
          <Option value="">全部等级</Option>
          <Option value="普通会员">普通会员</Option>
          <Option value="白银会员">白银会员</Option>
          <Option value="黄金会员">黄金会员</Option>
          <Option value="钻石会员">钻石会员</Option>
        </Select>
        <Select placeholder="状态" style={{ width: 120 }}>
          <Option value="">全部状态</Option>
          <Option value="1">正常</Option>
          <Option value="0">禁用</Option>
        </Select>
        <Button type="primary">搜索</Button>
        <Button>重置</Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="level"
            label="会员等级"
            rules={[{ required: true, message: '请选择会员等级' }]}
          >
            <Select placeholder="请选择会员等级">
              <Option value="普通会员">普通会员</Option>
              <Option value="白银会员">白银会员</Option>
              <Option value="黄金会员">黄金会员</Option>
              <Option value="钻石会员">钻石会员</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value={1}>正常</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;