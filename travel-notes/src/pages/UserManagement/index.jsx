import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Typography, message } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加用户');
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // 模拟获取用户数据
  useEffect(() => {
    // 模拟API请求
    setTimeout(() => {
      const mockUsers = [
        {
          id: 1,
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          createTime: '2023-01-15 08:30:00',
        },
        {
          id: 2,
          username: 'reviewer1',
          name: '审核员一',
          email: 'reviewer1@example.com',
          role: 'reviewer',
          status: 'active',
          createTime: '2023-02-20 10:15:00',
        },
        {
          id: 3,
          username: 'reviewer2',
          name: '审核员二',
          email: 'reviewer2@example.com',
          role: 'reviewer',
          status: 'inactive',
          createTime: '2023-03-05 14:45:00',
        },
        {
          id: 4,
          username: 'operator1',
          name: '操作员一',
          email: 'operator1@example.com',
          role: 'operator',
          status: 'active',
          createTime: '2023-04-10 09:20:00',
        },
        {
          id: 5,
          username: 'operator2',
          name: '操作员二',
          email: 'operator2@example.com',
          role: 'operator',
          status: 'active',
          createTime: '2023-05-18 11:30:00',
        },
      ];
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleMap = {
          admin: '管理员',
          reviewer: '审核员',
          operator: '操作员',
        };
        return roleMap[role] || role;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'active') {
          return <span style={{ color: '#52c41a' }}>启用</span>;
        } else {
          return <span style={{ color: '#f5222d' }}>禁用</span>;
        }
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
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

  // 处理添加用户
  const handleAdd = () => {
    setModalTitle('添加用户');
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑用户
  const handleEdit = (record) => {
    setModalTitle('编辑用户');
    setEditingId(record.id);
    form.setFieldsValue({
      username: record.username,
      name: record.name,
      email: record.email,
      role: record.role,
      status: record.status,
    });
    setModalVisible(true);
  };

  // 处理删除用户
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      onOk() {
        // 模拟删除操作
        setUsers(users.filter((user) => user.id !== id));
        message.success('删除成功');
      },
    });
  };

  // 处理表单提交
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingId) {
        // 编辑用户
        const updatedUsers = users.map((user) => {
          if (user.id === editingId) {
            return { ...user, ...values };
          }
          return user;
        });
        setUsers(updatedUsers);
        message.success('更新成功');
      } else {
        // 添加用户
        const newUser = {
          id: users.length + 1,
          ...values,
          createTime: new Date().toLocaleString(),
        };
        setUsers([...users, newUser]);
        message.success('添加成功');
      }
      setModalVisible(false);
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>用户管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加用户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
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
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">管理员</Option>
              <Option value="reviewer">审核员</Option>
              <Option value="operator">操作员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;