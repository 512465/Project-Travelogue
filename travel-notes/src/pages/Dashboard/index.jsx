import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography } from 'antd';
import { UserOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReviews: 0,
    pendingReviews: 0,
    completedReviews: 0,
  });
  const [recentReviews, setRecentReviews] = useState([]);

  // 模拟获取统计数据
  useEffect(() => {
    // 模拟API请求
    setTimeout(() => {
      setStats({
        totalUsers: 1256,
        totalReviews: 3824,
        pendingReviews: 128,
        completedReviews: 3696,
      });

      setRecentReviews([
        {
          key: '1',
          id: 'REV-001',
          title: '酒店评价审核',
          submitter: '张三',
          submitTime: '2023-10-15 14:30',
          status: '待审核',
        },
        {
          key: '2',
          id: 'REV-002',
          title: '景点评价审核',
          submitter: '李四',
          submitTime: '2023-10-15 13:25',
          status: '已通过',
        },
        {
          key: '3',
          id: 'REV-003',
          title: '餐厅评价审核',
          submitter: '王五',
          submitTime: '2023-10-15 11:18',
          status: '已拒绝',
        },
        {
          key: '4',
          id: 'REV-004',
          title: '旅游路线评价',
          submitter: '赵六',
          submitTime: '2023-10-15 10:05',
          status: '待审核',
        },
        {
          key: '5',
          id: 'REV-005',
          title: '交通服务评价',
          submitter: '钱七',
          submitTime: '2023-10-14 16:42',
          status: '已通过',
        },
      ]);

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
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '提交人',
      dataIndex: 'submitter',
      key: 'submitter',
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === '待审核') {
          return <span style={{ color: '#1890ff' }}>{status}</span>;
        } else if (status === '已通过') {
          return <span style={{ color: '#52c41a' }}>{status}</span>;
        } else {
          return <span style={{ color: '#f5222d' }}>{status}</span>;
        }
      },
    },
  ];

  return (
    <div style={{ width: '100%', padding: '20px', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Title level={2}>仪表盘</Title>
      <Row gutter={24}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总审核数"
              value={stats.totalReviews}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={stats.pendingReviews}
              prefix={<CloseCircleOutlined />}
              loading={loading}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成审核"
              value={stats.completedReviews}
              prefix={<CheckCircleOutlined />}
              loading={loading}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24, width: '100%' }}>
        <Title level={4}>最近审核</Title>
        <Card style={{ width: '100%' }}>
          <Table
            columns={columns}
            dataSource={recentReviews}
            loading={loading}
            pagination={false}
            style={{ width: '100%' }}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;