import { useState, useEffect } from 'react';
import { Table, Button, Input, Select, DatePicker, Space, Typography, message, Modal } from 'antd';
import { SearchOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import StatusTag from '../../components/StatusTag';
import ReviewActions from '../../components/ReviewActions';
import DeleteButton from '../../components/DeleteButton';
import { useNavigate } from 'react-router-dom';
import { travelogueApi } from '../../services/api';
import MediaGallery from '../../components/ImageGallery';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ReviewList = () => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
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
          submitterAvatar: item.userAvatar,
          submitTime: new Date(item.createTime).toLocaleString(),
          updateTime: new Date(item.updateTime).toLocaleString(),
          status: item.travelogueStatus,
          cover: item.travelogueCover,
          images: item.travelogueImages,
          userId: item.userId,
          views: item.travelogueViews,
          likes: item.travelogueLikes,
          collects: item.travelogueCollects,
          rejectReason: item.travelogueRejectReason,
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

  // 审核操作成功后的回调函数
  const handleReviewActionSuccess = () => {
    // 刷新数据
    fetchTravelogueData();
  };

  // 删除成功后的回调函数
  const handleDeleteSuccess = () => {
    // 检查当前页是否还有数据
    if (reviews.length === 1 && searchParams.page > 1) {
      // 如果当前页只有一条数据且不是第一页，则跳转到上一页
      const newPage = searchParams.page - 1;
      setSearchParams(prev => ({ ...prev, page: newPage }));
      fetchTravelogueData({ ...searchParams, page: newPage });
    } else {
      // 否则刷新当前页数据
      fetchTravelogueData();
    }
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
      render: (cover, record) => {
        // 判断是否为视频
        const isVideo = record.images && record.images[0] && record.images[0].type === 'video';
        if (isVideo) {
          return (
            <video
              src={cover}
              style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }}
              controls={false}
              muted
              preload="metadata"
            />
          );
        }
        return (
          <img 
            src={cover ? cover.replace(/`/g, '').trim() : ''} 
            alt="封面" 
            style={{ width: 60, height: 40, objectFit: 'cover' }} 
            loading="lazy"
          />
        );
      },
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
      render: (text) => <span title={text} style={{ display: 'inline-block', maxWidth: 230, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{text}</span>,
    },
    {
      title: '提交人',
      dataIndex: 'submitter',
      key: 'submitter',
      width: 140,
      render: (text, record) => (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {record.submitterAvatar && (
            <img
              src={record.submitterAvatar.startsWith('/') ? `https://wl.wanghun.dpdns.org${record.submitterAvatar}` : record.submitterAvatar}
              alt="头像"
              style={{ width: 28, height: 28, borderRadius: '50%', marginRight: 8, objectFit: 'cover' }}
            />
          )}
          {text}
        </span>
      ),
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: 80,
    },
    {
      title: '点赞',
      dataIndex: 'likes',
      key: 'likes',
      width: 80,
    },
    {
      title: '收藏',
      dataIndex: 'collects',
      key: 'collects',
      width: 80,
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
      render: (status) => <StatusTag status={status} />,
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
          <ReviewActions 
            travelogueId={record.id} 
            currentStatus={record.status} 
            onSuccess={handleReviewActionSuccess}
            size="small"
          />
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

  // 处理批量审核通过
  const handleBatchApprove = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要审核的游记');
      return;
    }

    setBatchLoading(true);
    try {
      const promises = selectedRowKeys.map(id => 
        travelogueApi.updateTravelogueStatus(id, { travelogueStatus: 1 })
      );
      await Promise.all(promises);
      message.success('批量审核通过成功');
      setSelectedRowKeys([]);
      fetchTravelogueData();
    } catch (error) {
      console.error('批量审核通过失败:', error);
      message.error(error?.response?.data?.message || '批量审核通过失败');
    } finally {
      setBatchLoading(false);
    }
  };

  // 处理批量拒绝
  const handleBatchReject = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要审核的游记');
      return;
    }

    if (!rejectReason.trim()) {
      message.warning('请输入拒绝理由');
      return;
    }

    setBatchLoading(true);
    try {
      const promises = selectedRowKeys.map(id => 
        travelogueApi.updateTravelogueStatus(id, { 
          travelogueStatus: -1,
          travelogueRejectReason: rejectReason.trim()
        })
      );
      await Promise.all(promises);
      message.success('批量拒绝成功');
      setSelectedRowKeys([]);
      setRejectModalVisible(false);
      setRejectReason('');
      fetchTravelogueData();
    } catch (error) {
      console.error('批量拒绝失败:', error);
      message.error(error?.response?.data?.message || '批量拒绝失败');
    } finally {
      setBatchLoading(false);
    }
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的游记');
      return;
    }
    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条游记吗？此操作不可恢复！`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setBatchLoading(true);
        try {
          await Promise.all(selectedRowKeys.map(id => travelogueApi.deleteTravelogue(id)));
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          // 判断删除后是否需要跳转到上一页
          if (reviews.length === selectedRowKeys.length && searchParams.page > 1) {
            // 当前页全删光且不是第一页，跳到上一页
            const newPage = searchParams.page - 1;
            setSearchParams(prev => ({ ...prev, page: newPage }));
            fetchTravelogueData({ ...searchParams, page: newPage });
          } else {
            // 否则刷新当前页
            fetchTravelogueData();
          }
        } catch (error) {
          message.error('批量删除失败');
        } finally {
          setBatchLoading(false);
        }
      }
    });
  };

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: false, // 允许所有行都能被选中
    }),
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

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleBatchApprove}
              loading={batchLoading}
            >
              批量通过
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => setRejectModalVisible(true)}
              loading={batchLoading}
            >
              批量拒绝
            </Button>
            <Button
              danger
              onClick={handleBatchDelete}
              loading={batchLoading}
            >
              批量删除
            </Button>
            <span style={{ marginLeft: 8 }}>
              已选择 {selectedRowKeys.length} 项
            </span>
          </Space>
        </div>
      )}

      <Table
        rowSelection={rowSelection}
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

      <Modal
        title="批量拒绝"
        open={rejectModalVisible}
        onOk={handleBatchReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
        }}
        confirmLoading={batchLoading}
      >
        <div>
          <p>请输入拒绝理由：</p>
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="请输入拒绝理由"
          />
        </div>
      </Modal>
    </div>
  );
};

export default ReviewList;