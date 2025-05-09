<template>
  <view class="container" v-if="travelListItems.length">
    <!-- 游记列表 -->
    <view class="travel-list">
      <view v-for="item in travelListItems" :key="item.travelogueId" class="travel-item">
        <image v-if="item.type" class="cover" :src="item.travelogueCover" mode="aspectFill" />
        <video v-else class="cover" :src="item.travelogueCover" />
        <view class="content">
          <view class="title">{{ item.travelogueTitle }}</view>
          <view class="desc">{{ truncateContent(item.travelogueContent) }}</view>
        </view>
      </view>
    </view>
  </view>
  <view v-else class="empty">
    <view class="empty-content">
      <image class="empty-icon" src="../../assets/2020031921552395638.jpg" mode="aspectFit" />
      <view class="empty-text">
        <view class="empty-title">还没有游记哦～</view>
        <view class="empty-subtitle">去首页看看吧</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useUserStore } from '../../stores/modules/user'

const travelListItems = ref([])
const userStore = useUserStore()

const getTravelogs = async () => {
  try {
    const res = await Taro.request({
      url: 'http://43.131.235.203:8586/api/travelogue/userCollects',
      method: 'GET',
      header: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    console.log(res)
    travelListItems.value = res.data.data.map((item) => {
      return {
        ...item,
        type: isImage(item.travelogueCover)
      }
    })
  } catch (error) {
    console.error(error)
  }
}

// 是否为图片
const isImage = (url) => {
  return /\.(jpg|jpeg|png|gif|bmp|webp)$/.test(url)
}

onMounted(() => {
  getTravelogs()
})

// 内容截断
const truncateContent = (text) => {
  return text.length > 20 ? text.substring(0, 20) + '...' : text
}
</script>

<style lang="scss">
.container {
  padding: 20rpx;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

.travel-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 20rpx;
}

.travel-item {
  position: relative;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  display: flex;
  flex-direction: column;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  .cover {
    width: 100%;
    height: 320rpx;
    border-radius: 24rpx 24rpx 0 0;
    background: #f8f9fa;
    transition: transform 0.3s ease;
  }

  .content {
    padding: 24rpx;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .title {
    font-size: 32rpx;
    font-weight: 600;
    color: #2d3436;
    line-height: 1.4;
    margin-bottom: 16rpx;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .desc {
    font-size: 26rpx;
    color: #636e72;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex-grow: 1;
  }

  // 状态标签样式优化
  .status {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    font-weight: 500;
    backdrop-filter: blur(10rpx);

    &.status-pass {
      background: #e7f6e9;
      color: #07c160;
    }

    &.status-pending {
      background: #fff7e6;
      color: #ff9900;
    }

    &.status-reject {
      background: #ffece8;
      color: #ff4d4f;
    }
  }
}

.empty {
  &-content {
    padding: 40rpx;
    text-align: center;
  }

  &-icon {
    width: 400rpx;
    height: 400rpx;
    opacity: 0.9;
    filter: drop-shadow(0 8rpx 16rpx rgba(0, 0, 0, 0.08));
  }

  &-title {
    font-size: 36rpx;
    color: #2d3436;
    margin-bottom: 24rpx;
    font-weight: 500;
  }

  &-subtitle {
    font-size: 28rpx;
    color: #636e72;

    a {
      color: #4a90e2;
      text-decoration: none;
    }
  }
}

// 加载动画
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.travel-item {
  animation: fadeIn 0.6s ease forwards;
  opacity: 0;

  @for $i from 1 through 6 {
    &:nth-child(#{$i}) {
      animation-delay: $i * 0.1s;
    }
  }
}
</style>
