import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Space, Typography, Divider, Modal, Input, message, Image } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { travelogueApi } from '../../services/api';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // 获取游记详情数据
  useEffect(() => {
    const fetchTravelogueDetail = async () => {
      setLoading(true);
      try {
        const response = await travelogueApi.getTravelogueDetail(id);
        if (response && response.data) {
          const travelogueData = response.data;
          // 将API返回的数据映射为组件需要的格式
          const formattedReview = {
            id: travelogueData.travelogueId,
            title: travelogueData.travelogueTitle,
            content: travelogueData.travelogueContent,
            submitter: travelogueData.travelogueAuthor,
            submitterInfo: {
              id: travelogueData.userId,
              name: travelogueData.travelogueAuthor,
              avatar: travelogueData.userAvatar,
            },
            images: travelogueData.travelogueImages || [],
            cover: travelogueData.travelogueCover,
            submitTime: new Date(travelogueData.createTime).toLocaleString(),
            updateTime: new Date(travelogueData.updateTime).toLocaleString(),
            status: travelogueData.travelogueStatus,
            reviewHistory: [
              {
                operator: '系统',
                operation: '创建游记',
                time: new Date(travelogueData.createTime).toLocaleString(),
                remark: '用户提交',
              },
            ],
            // 保存原始数据
            originalData: travelogueData
          };
          setReview(formattedReview);
        } else {
          message.error('获取游记详情失败');
        }
      } catch (error) {
        console.error('获取游记详情失败:', error);
        message.error('获取游记详情请求失败');
      } finally {
        setLoading(false);
      }
    };

    fetchTravelogueDetail();
  }, [id]);

  // 处理返回列表
  const handleBack = () => {
    navigate('/reviews');
  };

  // 处理审核通过
  const handleApprove = async () => {
    try {
      await travelogueApi.updateTravelogueStatus(review.id, 1);
      
      setReview({
        ...review,
        status: 1,
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
    } catch (error) {
      console.error('审核通过失败:', error);
      message.error('审核通过失败');
    }
  };

  // 处理审核拒绝
  const handleReject = () => {
    setRejectModalVisible(true);
  };

  // 确认拒绝
  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      message.error('请输入拒绝理由');
      return;
    }

    try {
      await travelogueApi.updateTravelogueStatus(review.id, -1);
      
      setReview({
        ...review,
        status: -1,
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
    } catch (error) {
      console.error('审核拒绝失败:', error);
      message.error('审核拒绝失败');
    }
  };

  // 渲染状态标签
  const renderStatusTag = (status) => {
    if (status === 0) {
      return <span style={{ color: '#1890ff' }}>待审核</span>;
    } else if (status === 1) {
      return <span style={{ color: '#52c41a' }}>已通过</span>;
    } else if (status === -1) {
      return <span style={{ color: '#f5222d' }}>已拒绝</span>;
    } else {
      return <span style={{ color: '#000000' }}>未知状态</span>;
    }
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
          <Descriptions.Item label="游记ID">{review.id}</Descriptions.Item>
          <Descriptions.Item label="审核状态">{renderStatusTag(review.status)}</Descriptions.Item>
          <Descriptions.Item label="标题" span={2}>{review.title}</Descriptions.Item>
          <Descriptions.Item label="作者">{review.submitter}</Descriptions.Item>
          <Descriptions.Item label="提交时间">{review.submitTime}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{review.updateTime}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="内容详情" style={{ marginBottom: 16, width: '100%' }}>
        <Paragraph style={{ width: '100%' }}>{review.content}</Paragraph>

        {review.images && review.images.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Divider orientation="left">媒体内容</Divider>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {review.images.map((media, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  {media.type === 'image' ? (
                    <Image
                      src={media.url ? media.url.replace(/`/g, '').trim() : ''}
                      alt={`图片${index + 1}`}
                      style={{ width: 200, height: 150, objectFit: 'cover' }}
                    />
                  ) : media.type === 'video' ? (
                    <video
                      src={media.url ? media.url.replace(/`/g, '').trim() : ''}
                      controls
                      style={{ width: 200, height: 150, objectFit: 'cover' }}
                    />
                  ) : null}
                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    {media.type === 'image' ? '图片' : '视频'} {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card title="作者信息" style={{ marginBottom: 16, width: '100%' }}>
        <Descriptions bordered column={2} style={{ width: '100%' }}>
          <Descriptions.Item label="用户ID">{review.submitterInfo.id}</Descriptions.Item>
          <Descriptions.Item label="用户名">{review.submitterInfo.name}</Descriptions.Item>
          {review.submitterInfo.avatar && (
            <Descriptions.Item label="头像" span={2}>
              <img 
                src={review.submitterInfo.avatar.startsWith('/') ? `https://travle.hub.feashow.cn${review.submitterInfo.avatar}` : review.submitterInfo.avatar} 
                alt="用户头像" 
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%' }} 
              />
            </Descriptions.Item>
          )}
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

      {review.status === 0 && (
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