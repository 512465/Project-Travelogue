import React from 'react';
import { Image, Empty } from 'antd';

/**
 * 图片展示组件
 * 用于统一展示游记中的图片列表
 * 支持配置图片大小和布局
 */
const ImageGallery = ({ 
  images = [], 
  width = 200, 
  height = 150, 
  gap = 16, 
  showTitle = true,
  emptyText = '暂无图片' 
}) => {
  // 处理图片URL，移除反引号
  const processImageUrl = (url) => {
    if (!url) return '';
    return url.replace(/`/g, '').trim();
  };

  // 如果没有图片，显示空状态
  if (!images || images.length === 0) {
    return <Empty description={emptyText} />;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap }}>
      {images.map((image, index) => (
        <div key={index} style={{ marginBottom: 16 }}>
          <Image
            src={processImageUrl(typeof image === 'string' ? image : image.url)}
            alt={`图片${index + 1}`}
            style={{ width, height, objectFit: 'cover' }}
          />
          {showTitle && (
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              图片 {index + 1}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;