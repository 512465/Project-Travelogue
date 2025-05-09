import { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Typography, Tag, Modal, Form, message, Drawer, Descriptions } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, EyeOutlined } from '@ant-design/icons';
import { userApi } from '../../services/api';

const { Title } = Typography;
const { Option } = Select;

/**
 * 管理员管理页面
 * 实现管理员列表展示、详情查看、编辑和删除功能
 */
const AdminManagement = () => {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [form] = Form.useForm();

  // 获取管理员列表数据
  const fetchAdminList = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAdminList();
      if (response && response.success) {
        // 确保数据是数组类型
        const adminList = Array.isArray(response.data) ? response.data : 
                         (response.data?.items ? response.data.items : []);
        setAdmins(adminList);
      } else {
        setAdmins([]);
        message.error(response?.message || '获取管理员列表失败');
      }
    } catch (error) {
      console.error('获取管理员列表失败:', error);
      setAdmins([]);
      message.error(error?.response?.data?.message || '获取管理员列表请求失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchAdminList();
  }, []);

  // 查看管理员详情
  const handleViewDetail = async (adminId) => {
    try {
      const response = await userApi.getAdminInfo(adminId);
      if (response && response.success && response.data) {
        setCurrentAdmin(response.data);
        setDrawerVisible(true);
      } else {
        message.error(response?.message || '获取管理员详情失败');
      }
    } catch (error) {
      console.error('获取管理员详情失败:', error);
      message.error(error?.response?.data?.message || '获取管理员详情请求失败');
    }
  };

  // 处理编辑管理员
  const handleEdit = async (adminId) => {
    try {
      const response = await userApi.getAdminInfo(adminId);
      if (response && response.success && response.data) {
        const adminData = response.data;
        setCurrentAdmin(adminData);
        form.setFieldsValue({
          adminName: adminData.adminName,
          adminAuth: adminData.adminAuth,
        });
        setModalVisible(true);
      } else {
        message.error(response?.message || '获取管理员详情失败');
      }
    } catch (error) {
      console.error('获取管理员详情失败:', error);
      message.error(error?.response?.data?.message || '获取管理员详情请求失败');
    }
  };

  // 处理删除管理员
  const handleDelete = (adminId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个管理员吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await userApi.deleteAdmin(adminId);
          if (response && response.success) {
            message.success('删除成功');
            fetchAdminList();
          } else {
            message.error(response?.message || '删除管理员失败');
          }
        } catch (error) {
          console.error('删除管理员失败:', error);
          message.error(error?.response?.data?.message || '删除管理员请求失败');
        }
      },
    });
  };

  // 处理表单提交（更新管理员信息）
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (currentAdmin) {
        const response = await userApi.updateAdmin(currentAdmin.adminId, values);
        if (response && response.success) {
          message.success('更新成功');
          setModalVisible(false);
          fetchAdminList();
        } else {
          message.error(response?.message || '更新管理员失败');
        }
      }
    } catch (error) {
      console.error('表单验证或提交失败:', error);
      if (error.errorFields) {
        message.error('请检查表单填写是否正确');
      } else {
        message.error(error?.response?.data?.message || '更新管理员请求失败');
      }
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '管理员ID',
      dataIndex: 'adminId',
      key: 'adminId',
      width: 100,
    },
    {
      title: '管理员名称',
      dataIndex: 'adminName',
      key: 'adminName',
      width: 150,
    },
    {
      title: '权限等级',
      dataIndex: 'adminAuth',
      key: 'adminAuth',
      width: 100,
      render: (auth) => {
        if (auth === 1) {
          return <Tag color="green">普通管理员</Tag>;
        } else if (auth === 2) {
          return <Tag color="gold">高级管理员</Tag>;
        } else if (auth === 3) {
          return <Tag color="purple">超级管理员</Tag>;
        } else {
          return <Tag color="default">未知权限</Tag>;
        }
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 180,
      render: (time) => new Date(time).toLocaleString(),
      sorter: (a, b) => new Date(a.createdTime) - new Date(b.createdTime),
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record.adminId)}
          >
            查看
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record.adminId)}
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.adminId)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Title level={2}>管理员管理</Title>
      </div>

      <Table
        columns={columns}
        dataSource={Array.isArray(admins) ? admins : []}
        rowKey="adminId"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      {/* 编辑管理员对话框 */}
      <Modal
        title="编辑管理员"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="adminName"
            label="管理员名称"
            rules={[{ required: true, message: '请输入管理员名称' }]}
          >
            <Input placeholder="请输入管理员名称" />
          </Form.Item>
          <Form.Item
            name="adminAuth"
            label="权限等级"
            rules={[{ required: true, message: '请选择权限等级' }]}
          >
            <Select placeholder="请选择权限等级">
              <Option value={1}>普通管理员</Option>
              <Option value={2}>高级管理员</Option>
              <Option value={3}>超级管理员</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 管理员详情抽屉 */}
      <Drawer
        title="管理员详情"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={500}
      >
        {currentAdmin && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="管理员ID">{currentAdmin.adminId}</Descriptions.Item>
            <Descriptions.Item label="管理员名称">{currentAdmin.adminName}</Descriptions.Item>
            <Descriptions.Item label="权限等级">
              {currentAdmin.adminAuth === 1 && <Tag color="green">普通管理员</Tag>}
              {currentAdmin.adminAuth === 2 && <Tag color="gold">高级管理员</Tag>}
              {currentAdmin.adminAuth === 3 && <Tag color="purple">超级管理员</Tag>}
              {(currentAdmin.adminAuth !== 1 && currentAdmin.adminAuth !== 2 && currentAdmin.adminAuth !== 3) && 
                <Tag color="default">未知权限</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(currentAdmin.createdTime).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default AdminManagement;