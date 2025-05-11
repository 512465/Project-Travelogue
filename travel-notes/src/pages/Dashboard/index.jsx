import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Tag, message } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { travelogueApi } from '../../services/api';

const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    pendingReviews: 0,
    completedReviews: 0,
  });
  const [recentReviews, setRecentReviews] = useState([]);

  // 获取仪表盘统计数据
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        // 获取所有游记数据进行统计
        const allTraveloguesResponse = await travelogueApi.getTravelogueList({
          page: 1,
          limit: 1000 // 获取尽可能多的记录用于统计
        });
        
        // 获取最近的游记列表用于展示
        const recentTraveloguesResponse = await travelogueApi.getTravelogueList({
          page: 1,
          limit: 10 // 获取最近的10条记录
        });
        
        if (allTraveloguesResponse && allTraveloguesResponse.data) {
          const allTravelogueData = allTraveloguesResponse.data.items || [];
          const totalCount = allTraveloguesResponse.data.total || 0;
          
          // 计算不同状态的游记数量
          let pendingCount = 0; // 待审核数量 (status=0)
          let approvedCount = 0; // 已通过数量 (status=1)
          let rejectedCount = 0; // 已拒绝数量 (status=-1)
          
          // 统计各状态游记数量
          allTravelogueData.forEach(item => {
            if (item.travelogueStatus === 0) pendingCount++;
            else if (item.travelogueStatus === 1) approvedCount++;
            else if (item.travelogueStatus === -1) rejectedCount++;
          });
          
          // 更新统计数据
          setStats({
            totalReviews: totalCount, // 游记总数
            pendingReviews: pendingCount, // 待审核数量
            completedReviews: approvedCount + rejectedCount, // 已完成审核数量（通过+拒绝）
            approvedReviews: approvedCount, // 已通过数量
            rejectedReviews: rejectedCount, // 已拒绝数量
          });
          
          // 格式化最近的游记列表用于展示
          if (recentTraveloguesResponse && recentTraveloguesResponse.data && recentTraveloguesResponse.data.items) {
            const recentTravelogueData = recentTraveloguesResponse.data.items;
            const formattedReviews = recentTravelogueData.map((item, index) => ({
              key: index.toString(),
              id: item.travelogueId,
              title: item.travelogueTitle,
              submitter: item.travelogueAuthor,
              submitTime: new Date(item.createTime).toLocaleString(),
              status: item.travelogueStatus === 0 ? '待审核' : 
                     item.travelogueStatus === 1 ? '已通过' : 
                     item.travelogueStatus === -1 ? '已拒绝' : '未知状态',
              statusCode: item.travelogueStatus
            }));
            setRecentReviews(formattedReviews);
          }
        } else {
          message.error('获取仪表盘数据失败');
        }
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
        message.error('获取仪表盘数据请求失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
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
      ellipsis: true,
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
      render: (status, record) => {
        if (record.statusCode === 0) {
          return <Tag color="blue">待审核</Tag>;
        } else if (record.statusCode === 1) {
          return <Tag color="green">已通过</Tag>;
        } else if (record.statusCode === -1) {
          return <Tag color="red">已拒绝</Tag>;
        } else {
          return <Tag color="default">未知状态</Tag>;
        }
      },
    },
  ];

  return (
    <div style={{ width: '100%', padding: '20px', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Title level={2}>仪表盘</Title>
      <Row gutter={24}>
        <Col span={8}>
          <Card>
            <Statistic
              title="游记总数"
              value={stats.totalReviews}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
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
        <Col span={8}>
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
      
      <Row gutter={24} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card>
            <Statistic
              title="已通过"
              value={stats.approvedReviews}
              loading={loading}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="已拒绝"
              value={stats.rejectedReviews}
              loading={loading}
              valueStyle={{ color: '#f5222d' }}
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