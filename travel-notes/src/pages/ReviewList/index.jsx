import { useState, useEffect } from 'react';
import { Table, Button, Input, Select, DatePicker, Space, Tag, Typography, message, Modal } from 'antd';
const { TextArea } = Input;
import { SearchOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import DeleteButton from '../../components/DeleteButton';
import { useNavigate } from 'react-router-dom';
import { travelogueApi } from '../../services/api';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ReviewList = () => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    travelogueStatus: '', // 或者其他默认状态值
    page: 1,
    limit: 10, // 或者其他默认分页大小
  });
  const [total, setTotal] = useState(0);



  const fetchTravelogueData = async (params = searchParams) => {
    setLoading(true);
    try {
      const response = await travelogueApi.getTravelogueList(params);
      if (response && response.data && response.data.items) {
        // 将API返回的数据映射为组件需要的格式
        const formattedData = response.data.items.map(item => ({
          id: item.travelogueId,
          title: item.travelogueTitle,
          content: item.travelogueContent,
          submitter: item.travelogueAuthor,
          submitTime: new Date(item.createTime).toLocaleString(),
          status: item.travelogueStatus,
          cover: item.travelogueCover,
          images: item.travelogueImages,
          userId: item.userId,
          userAvatar: item.userAvatar,
          // 保留原始数据，以便在详情页使用
          originalData: item
        }));
        setReviews(formattedData);
        setTotal(response.data.total || 0);
      } else {
        setReviews([]);
        setTotal(0);
        message.error(response?.message || '获取游记列表失败');
      }
    } catch (error) {
      console.error('获取游记列表失败:', error);
      message.error(error?.response?.data?.message || '获取游记列表请求失败');
      setReviews([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelogueData();
  }, []);

  // 处理查看详情
  const handleView = (id) => {
    navigate(`/reviews/${id}`);
  };

  // 处理审核通过
  const handleApprove = async (id) => {
    try {
      // 使用新的API方法，只传递travelogueStatus参数
      await travelogueApi.updateTravelogueStatus(id, { travelogueStatus: 1 });
      message.success('审核通过成功');
      // 更新本地数据状态
      setReviews(
        reviews.map((review) =>
          review.id === id ? { ...review, status: 1 } : review
        )
      );
      // 刷新数据
      fetchTravelogueData();
    } catch (error) {
      console.error('审核通过失败:', error);
      message.error('审核通过失败');
    }
  };

  // 处理审核拒绝
  const handleReject = async (id) => {
    // 弹出对话框让用户输入拒绝原因
    Modal.confirm({
      title: '拒绝审核',
      content: (
        <div>
          <p>请输入拒绝理由：</p>
          <TextArea 
            rows={4} 
            onChange={(e) => {
              Modal.confirm.rejectReason = e.target.value;
            }} 
            placeholder="请输入拒绝理由"
          />
        </div>
      ),
      onOk: async () => {
        const rejectReason = Modal.confirm.rejectReason;
        if (!rejectReason || !rejectReason.trim()) {
          message.error('请输入拒绝理由');
          return Promise.reject('请输入拒绝理由');
        }
        
        try {
          // 使用新的API方法，传递travelogueStatus和travelogueRejectReason参数
          await travelogueApi.updateTravelogueStatus(id, {
            travelogueStatus: -1,
            travelogueRejectReason: rejectReason
          });
          message.success('审核拒绝成功');
          // 更新本地数据状态
          setReviews(
            reviews.map((review) =>
              review.id === id ? { ...review, status: -1 } : review
            )
          );
          // 刷新数据
          fetchTravelogueData();
        } catch (error) {
          console.error('审核拒绝失败:', error);
          message.error('审核拒绝失败');
          return Promise.reject(error);
        }
      },
    });
  };

  // 删除成功后的回调函数
  const handleDeleteSuccess = () => {
    // 刷新数据
    fetchTravelogueData();
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '封面',
      dataIndex: 'cover',
      key: 'cover',
      width: 100,
      render: (cover) => (
        <img 
          src={cover ? cover.replace(/`/g, '').trim() : ''} 
          alt="封面" 
          style={{ width: 60, height: 40, objectFit: 'cover' }} 
        />
      ),
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
        if (status === 0) {
          return <Tag color="blue">待审核</Tag>;
        } else if (status === 1) {
          return <Tag color="green">已通过</Tag>;
        } else if (status === -1){
          return <Tag color="red">已拒绝</Tag>;
        } else {
          return <Tag color="black">删除</Tag>;
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
          {record.status === 0 && (
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
          {(record.status === 1 || record.status === -1) && (
            <DeleteButton 
              travelogueId={record.id} 
              onSuccess={handleDeleteSuccess} 
            />
          )}
        </Space>
      ),
    },
  ];



  // 处理搜索参数变化
  const handleSearchChange = (key, value) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 处理搜索按钮点击
  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, page: 1 })); // 重置到第一页
    fetchTravelogueData({ ...searchParams, page: 1 });
  };

  // 处理重置按钮点击
  const handleReset = () => {
    const resetParams = {
      keyword: '',
      travelogueStatus: '',
      page: 1,
      limit: 10
    };
    setSearchParams(resetParams);
    fetchTravelogueData(resetParams);
  };

  // 处理分页变化
  const handlePageChange = (page, pageSize) => {
    const newParams = { ...searchParams, page, limit: pageSize };
    setSearchParams(newParams);
    fetchTravelogueData(newParams);
  };

  return (
    <div style={{ width: '100%', padding: '20px', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Title level={2}>游记审核管理</Title>

      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索标题/作者"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={searchParams.keyword}
            onChange={(e) => handleSearchChange('keyword', e.target.value)}
          />
          <Select 
            placeholder="审核状态" 
            style={{ width: 120 }}
            value={searchParams.travelogueStatus}
            onChange={(value) => handleSearchChange('travelogueStatus', value)}
          >
            <Option value="">全部</Option>
            <Option value="0">待审核</Option>
            <Option value="1">已通过</Option>
            <Option value="-1">已拒绝</Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={reviews}
        rowKey="id"
        loading={loading}
        pagination={{
          current: searchParams.page,
          pageSize: searchParams.limit,
          total: total,
          onChange: handlePageChange,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        style={{ width: '100%' }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default ReviewList;