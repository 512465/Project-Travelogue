import { useState, useEffect } from 'react';
import { Table, Button, Input, Select, DatePicker, Space, Tag, Typography } from 'antd';
import { SearchOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ReviewList = () => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  // 模拟获取审核数据
  useEffect(() => {
    // 模拟API请求
    setTimeout(() => {
      const mockReviews = [
        {
          id: 'REV-001',
          title: '酒店评价审核',
          content: '这家酒店服务态度很差，房间也不干净，不推荐入住。',
          type: 'hotel',
          submitter: '张三',
          submitTime: '2023-10-15 14:30',
          status: 'pending',
        },
        {
          id: 'REV-002',
          title: '景点评价审核',
          content: '风景很美，但是人太多了，体验一般。',
          type: 'attraction',
          submitter: '李四',
          submitTime: '2023-10-15 13:25',
          status: 'approved',
        },
        {
          id: 'REV-003',
          title: '餐厅评价审核',
          content: '菜品难吃，价格还贵，服务员态度也不好。',
          type: 'restaurant',
          submitter: '王五',
          submitTime: '2023-10-15 11:18',
          status: 'rejected',
        },
        {
          id: 'REV-004',
          title: '旅游路线评价',
          content: '行程安排合理，导游讲解详细，非常满意。',
          type: 'route',
          submitter: '赵六',
          submitTime: '2023-10-15 10:05',
          status: 'pending',
        },
        {
          id: 'REV-005',
          title: '交通服务评价',
          content: '司机很专业，车辆也很干净，体验很好。',
          type: 'transport',
          submitter: '钱七',
          submitTime: '2023-10-14 16:42',
          status: 'approved',
        },
        {
          id: 'REV-006',
          title: '酒店设施评价',
          content: '游泳池很小，健身房设备陈旧，不值这个价格。',
          type: 'hotel',
          submitter: '孙八',
          submitTime: '2023-10-14 15:30',
          status: 'pending',
        },
        {
          id: 'REV-007',
          title: '景点服务评价',
          content: '讲解员态度恶劣，完全不专业，浪费时间。',
          type: 'attraction',
          submitter: '周九',
          submitTime: '2023-10-14 14:20',
          status: 'pending',
        },
        {
          id: 'REV-008',
          title: '餐厅环境评价',
          content: '环境很好，但是上菜太慢了，等了一个小时。',
          type: 'restaurant',
          submitter: '吴十',
          submitTime: '2023-10-14 12:10',
          status: 'pending',
        },
      ];
      setReviews(mockReviews);
      setLoading(false);
    }, 1000);
  }, []);

  // 处理查看详情
  const handleView = (id) => {
    navigate(`/reviews/${id}`);
  };

  // 处理审核通过
  const handleApprove = (id) => {
    setReviews(
      reviews.map((review) =>
        review.id === id ? { ...review, status: 'approved' } : review
      )
    );
  };

  // 处理审核拒绝
  const handleReject = (id) => {
    setReviews(
      reviews.map((review) =>
        review.id === id ? { ...review, status: 'rejected' } : review
      )
    );
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 250,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const typeMap = {
          hotel: '酒店',
          attraction: '景点',
          restaurant: '餐厅',
          route: '路线',
          transport: '交通',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: '提交人',
      dataIndex: 'submitter',
      key: 'submitter',
      width: 100,
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 150,
      sorter: (a, b) => new Date(a.submitTime) - new Date(b.submitTime),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        if (status === 'pending') {
          return <Tag color="blue">待审核</Tag>;
        } else if (status === 'approved') {
          return <Tag color="green">已通过</Tag>;
        } else {
          return <Tag color="red">已拒绝</Tag>;
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record.id)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                onClick={() => handleApprove(record.id)}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                通过
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                size="small"
                onClick={() => handleReject(record.id)}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', padding: '20px', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Title level={2}>审核管理</Title>

      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索标题/内容"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
          />
          <Select placeholder="审核状态" style={{ width: 120 }}>
            <Option value="">全部</Option>
            <Option value="pending">待审核</Option>
            <Option value="approved">已通过</Option>
            <Option value="rejected">已拒绝</Option>
          </Select>
          <Select placeholder="内容类型" style={{ width: 120 }}>
            <Option value="">全部</Option>
            <Option value="hotel">酒店</Option>
            <Option value="attraction">景点</Option>
            <Option value="restaurant">餐厅</Option>
            <Option value="route">路线</Option>
            <Option value="transport">交通</Option>
          </Select>
          <RangePicker placeholder={['开始日期', '结束日期']} />
          <Button type="primary" icon={<SearchOutlined />}>
            搜索
          </Button>
          <Button>重置</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={reviews}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        style={{ width: '100%' }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default ReviewList;