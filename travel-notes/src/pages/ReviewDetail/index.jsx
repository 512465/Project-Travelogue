import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Space, Typography, Divider, Modal, Input, message } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // 模拟获取审核详情数据
  useEffect(() => {
    // 模拟API请求
    setTimeout(() => {
      // 根据ID查找对应的审核内容
      const mockReview = {
        id: id,
        title: '酒店评价审核',
        content: '这家酒店服务态度很差，房间也不干净，不推荐入住。前台服务人员态度冷漠，办理入住等了半小时。房间卫生状况堪忧，浴室有霉斑，床单也不够干净。餐厅食物质量一般，价格却很高。总体来说，不值这个价格，不会再来。',
        type: 'hotel',
        submitter: '张三',
        submitterInfo: {
          id: 'USER-001',
          name: '张三',
          phone: '138****1234',
          email: 'zhangsan@example.com',
          registerTime: '2022-05-10',
          level: '黄金会员',
        },
        targetInfo: {
          id: 'HOTEL-001',
          name: '海景大酒店',
          address: '上海市浦东新区陆家嘴环路1000号',
          rating: 4.2,
          price: '¥880/晚',
        },
        images: [
          'https://picsum.photos/id/1018/600/400',
          'https://picsum.photos/id/1015/600/400',
        ],
        submitTime: '2023-10-15 14:30',
        status: 'pending',
        reviewHistory: [
          {
            operator: '李四',
            operation: '创建审核',
            time: '2023-10-15 14:30',
            remark: '系统自动创建',
          },
        ],
      };
      setReview(mockReview);
      setLoading(false);
    }, 1000);
  }, [id]);

  // 处理返回列表
  const handleBack = () => {
    navigate('/reviews');
  };

  // 处理审核通过
  const handleApprove = () => {
    setReview({
      ...review,
      status: 'approved',
      reviewHistory: [
        ...review.reviewHistory,
        {
          operator: '管理员',
          operation: '审核通过',
          time: new Date().toLocaleString(),
          remark: '内容符合规范',
        },
      ],
    });
    message.success('审核已通过');
  };

  // 处理审核拒绝
  const handleReject = () => {
    setRejectModalVisible(true);
  };

  // 确认拒绝
  const confirmReject = () => {
    if (!rejectReason.trim()) {
      message.error('请输入拒绝理由');
      return;
    }

    setReview({
      ...review,
      status: 'rejected',
      reviewHistory: [
        ...review.reviewHistory,
        {
          operator: '管理员',
          operation: '审核拒绝',
          time: new Date().toLocaleString(),
          remark: rejectReason,
        },
      ],
    });

    setRejectModalVisible(false);
    setRejectReason('');
    message.success('审核已拒绝');
  };

  // 渲染状态标签
  const renderStatusTag = (status) => {
    if (status === 'pending') {
      return <span style={{ color: '#1890ff' }}>待审核</span>;
    } else if (status === 'approved') {
      return <span style={{ color: '#52c41a' }}>已通过</span>;
    } else {
      return <span style={{ color: '#f5222d' }}>已拒绝</span>;
    }
  };

  // 渲染类型
  const renderType = (type) => {
    const typeMap = {
      hotel: '酒店',
      attraction: '景点',
      restaurant: '餐厅',
      route: '路线',
      transport: '交通',
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!review) {
    return <div>未找到审核内容</div>;
  }

  return (
    <div style={{ width: '100%', padding: '20px 40px', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回列表
        </Button>
      </div>

      <Title level={2}>审核详情</Title>

      <Card title="基本信息" style={{ marginBottom: 16, width: '100%' }}>
        <Descriptions bordered column={2} style={{ width: '100%' }}>
          <Descriptions.Item label="审核ID">{review.id}</Descriptions.Item>
          <Descriptions.Item label="审核状态">{renderStatusTag(review.status)}</Descriptions.Item>
          <Descriptions.Item label="标题">{review.title}</Descriptions.Item>
          <Descriptions.Item label="类型">{renderType(review.type)}</Descriptions.Item>
          <Descriptions.Item label="提交人">{review.submitter}</Descriptions.Item>
          <Descriptions.Item label="提交时间">{review.submitTime}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="内容详情" style={{ marginBottom: 16, width: '100%' }}>
        <Paragraph style={{ width: '100%' }}>{review.content}</Paragraph>

        {review.images && review.images.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Divider orientation="left">图片</Divider>
            <div style={{ display: 'flex', gap: 8 }}>
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`图片${index + 1}`}
                  style={{ width: 200, height: 150, objectFit: 'cover' }}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card title="提交人信息" style={{ marginBottom: 16, width: '100%' }}>
        <Descriptions bordered column={2} style={{ width: '100%' }}>
          <Descriptions.Item label="用户ID">{review.submitterInfo.id}</Descriptions.Item>
          <Descriptions.Item label="姓名">{review.submitterInfo.name}</Descriptions.Item>
          <Descriptions.Item label="手机号">{review.submitterInfo.phone}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{review.submitterInfo.email}</Descriptions.Item>
          <Descriptions.Item label="注册时间">{review.submitterInfo.registerTime}</Descriptions.Item>
          <Descriptions.Item label="会员等级">{review.submitterInfo.level}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="评价对象信息" style={{ marginBottom: 16, width: '100%' }}>
        <Descriptions bordered column={2} style={{ width: '100%' }}>
          <Descriptions.Item label="对象ID">{review.targetInfo.id}</Descriptions.Item>
          <Descriptions.Item label="名称">{review.targetInfo.name}</Descriptions.Item>
          <Descriptions.Item label="地址">{review.targetInfo.address}</Descriptions.Item>
          <Descriptions.Item label="评分">{review.targetInfo.rating}</Descriptions.Item>
          <Descriptions.Item label="价格">{review.targetInfo.price}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="审核历史" style={{ width: '100%' }}>
        <Descriptions bordered column={1} style={{ width: '100%' }}>
          {review.reviewHistory.map((history, index) => (
            <Descriptions.Item
              key={index}
              label={`${history.time} - ${history.operator} - ${history.operation}`}
            >
              {history.remark}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>

      {review.status === 'pending' && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Space size="large">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              size="large"
              onClick={handleApprove}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              通过审核
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              size="large"
              onClick={handleReject}
            >
              拒绝审核
            </Button>
          </Space>
        </div>
      )}

      <Modal
        title="拒绝理由"
        open={rejectModalVisible}
        onOk={confirmReject}
        onCancel={() => setRejectModalVisible(false)}
      >
        <TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="请输入拒绝理由"
        />
      </Modal>
    </div>
  );
};

export default ReviewDetail;