import React from 'react';
import { Image, Empty } from 'antd';

/**
 * 媒体展示组件
 * 支持图片和视频混合展示
 */
const MediaGallery = ({ 
  media = [], 
  width = 200, 
  height = 150, 
  gap = 16, 
  showTitle = true,
  emptyText = '暂无媒体' 
}) => {
  // 处理URL
  const processUrl = (url) => {
    if (!url) return '';
    return url.replace(/`/g, '').trim();
  };

  if (!media || media.length === 0) {
    return <Empty description={emptyText} />;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap }}>
      {media.map((item, index) => {
        const type = item.type || (typeof item === 'string' ? 'image' : 'image');
        const url = processUrl(typeof item === 'string' ? item : item.url);
        if (type === 'video') {
          return (
            <div key={index} style={{ marginBottom: 16 }}>
              <video
                src={url}
                style={{ width, height, objectFit: 'cover', borderRadius: 4 }}
                controls
                preload="metadata"
              />
              {showTitle && (
                <div style={{ marginTop: 8, textAlign: 'center' }}>
                  视频 {index + 1}
                </div>
              )}
            </div>
          );
        }
        // 默认图片
        return (
          <div key={index} style={{ marginBottom: 16 }}>
            <Image
              src={url}
              alt={`图片${index + 1}`}
              style={{ width, height, objectFit: 'cover' }}
              imgProps={{ loading: 'lazy' }}
            />
            {showTitle && (
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                图片 {index + 1}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MediaGallery;