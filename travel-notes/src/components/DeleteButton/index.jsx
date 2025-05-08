import React from 'react';
import { Button, Modal, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { travelogueApi } from '../../services/api';

/**
 * 删除按钮组件
 * 根据管理员权限决定是否显示删除按钮
 * adminAuth为1时才有删除权限
 */
const DeleteButton = ({ travelogueId, onSuccess }) => {
  // 从Redux中获取用户信息，包括adminAuth
  const user = useSelector((state) => state.auth.user);

  // 检查是否有删除权限
  const hasDeletePermission = user && user.adminAuth === 1;

  // 如果没有删除权限，不渲染按钮
  if (!hasDeletePermission) {
    return null;
  }

  // 处理删除
  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条游记吗？删除后将无法恢复。',
      onOk: async () => {
        try {
          // 调用删除API
          await travelogueApi.deleteTravelogue(travelogueId);
          message.success('删除成功');
          // 调用成功回调，通常用于刷新列表
          if (onSuccess) {
            onSuccess();
          }
        } catch (error) {
          console.error('删除失败:', error);
          message.error(error?.response?.data?.message || '删除失败');
          return Promise.reject(error);
        }
      },
    });
  };

  return (
    <Button
      danger
      icon={<DeleteOutlined />}
      size="small"
      onClick={handleDelete}
    >
      删除
    </Button>
  );
};

export default DeleteButton;