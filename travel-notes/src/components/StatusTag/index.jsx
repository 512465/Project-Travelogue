import React from 'react';
import { Tag } from 'antd';

/**
 * 状态标签组件
 * 根据状态值显示不同颜色和文本的标签
 * 用于统一展示游记审核状态
 */
const StatusTag = ({ status }) => {
  // 状态映射配置
  const statusConfig = {
    0: { color: 'gold', text: '待审核' },
    1: { color: 'green', text: '已通过' },
    '-1': { color: 'red', text: '已拒绝' },
    3: { color: '', text: '已删除' },
  };

  // 获取当前状态配置，如果没有匹配则显示未知状态
  const currentStatus = statusConfig[status] || { color: 'default', text: '未知状态' };

  return (
    <Tag color={currentStatus.color}>
      {currentStatus.text}
    </Tag>
  );
};

export default StatusTag;