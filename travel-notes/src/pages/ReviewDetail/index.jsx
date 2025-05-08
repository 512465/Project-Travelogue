import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Space, Typography, Divider, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import StatusTag from '../../components/StatusTag';
import ReviewActions from '../../components/ReviewActions';
import DeleteButton from '../../components/DeleteButton';
import ImageGallery from '../../components/ImageGallery';
import { travelogueApi } from '../../services/api';

const { Title, Paragraph } = Typography;

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState(null);


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

  // 审核操作成功后的回调函数
  const handleReviewActionSuccess = async () => {
    // 重新获取游记详情
    try {
      const response = await travelogueApi.getTravelogueDetail(id);
      if (response && response.data) {
        const travelogueData = response.data;
        // 更新状态
        setReview({
          ...review,
          status: travelogueData.travelogueStatus,
          reviewHistory: [
            ...review.reviewHistory,
            {
              operator: '管理员',
              operation: travelogueData.travelogueStatus === 1 ? '审核通过' : '审核拒绝',
              time: new Date().toLocaleString(),
              remark: travelogueData.travelogueStatus === 1 ? '内容符合规范' : travelogueData.travelogueRejectReason || '内容不符合规范',
            },
          ],
        });
      }
    } catch (error) {
      console.error('获取更新后的游记详情失败:', error);
    }
  };
  
  // 删除成功后的回调函数
  const handleDeleteSuccess = () => {
    // 返回列表页
    navigate('/reviews');
    message.success('游记已删除');
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
          <Descriptions.Item label="审核状态"><StatusTag status={review.status} /></Descriptions.Item>
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
            <ImageGallery 
              images={review.images.filter(media => media.type === 'image').map(media => media.url)} 
              width={200}
              height={150}
              gap={16}
            />
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

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Space size="large">
          <ReviewActions 
            travelogueId={review.id} 
            currentStatus={review.status} 
            onSuccess={handleReviewActionSuccess}
            size="large"
          />
          <DeleteButton 
            travelogueId={review.id} 
            onSuccess={handleDeleteSuccess} 
          />
        </Space>
      </div>
    </div>
  );
};

export default ReviewDetail;