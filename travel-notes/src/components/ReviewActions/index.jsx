import React, { useState } from 'react';
import { Button, Modal, Input, message, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { travelogueApi } from '../../services/api';

const { TextArea } = Input;

/**
 * 游记审核操作组件
 * 提供通过和拒绝功能，可在列表和详情页复用
 */
const ReviewActions = ({ travelogueId, currentStatus, onSuccess, size = 'middle', showText = true }) => {
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  // 处理审核通过
  const handleApprove = async () => {
    setLoading(true);
    try {
      await travelogueApi.updateTravelogueStatus(travelogueId, { travelogueStatus: 1 });
      message.success('审核通过成功');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('审核通过失败:', error);
      message.error(error?.response?.data?.message || '审核通过失败');
    } finally {
      setLoading(false);
    }
  };

  // 显示拒绝对话框
  const showRejectModal = () => {
    setRejectModalVisible(true);
  };

  // 处理拒绝对话框取消
  const handleRejectCancel = () => {
    setRejectModalVisible(false);
    setRejectReason('');
  };

  // 处理审核拒绝
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      message.warning('请输入拒绝理由');
      return;
    }

    setLoading(true);
    try {
      await travelogueApi.updateTravelogueStatus(travelogueId, { 
        travelogueStatus: -1,
        rejectReason: rejectReason.trim() 
      });
      message.success('审核拒绝成功');
      setRejectModalVisible(false);
      setRejectReason('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('审核拒绝失败:', error);
      message.error(error?.response?.data?.message || '审核拒绝失败');
    } finally {
      setLoading(false);
    }
  };

  // 如果已经审核过，不显示操作按钮
  if (currentStatus === 1 || currentStatus === -1) {
    return null;
  }

  return (
    <>
      <Space>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={handleApprove}
          loading={loading}
          size={size}
        >
          {showText ? '通过' : ''}
        </Button>
        <Button
          danger
          icon={<CloseCircleOutlined />}
          onClick={showRejectModal}
          loading={loading}
          size={size}
        >
          {showText ? '拒绝' : ''}
        </Button>
      </Space>

      <Modal
        title="拒绝审核"
        open={rejectModalVisible}
        onOk={handleRejectConfirm}
        onCancel={handleRejectCancel}
        confirmLoading={loading}
      >
        <div>
          <p>请输入拒绝理由：</p>
          <TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="请输入拒绝理由"
          />
        </div>
      </Modal>
    </>
  );
};

export default ReviewActions;