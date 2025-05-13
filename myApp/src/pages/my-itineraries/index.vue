<template>
  <view
    style="background-image: url('https://wl.wanghun.dpdns.org/uploads/2020031921552395638.jpg');"
    class="container" v-if="!userStore.token">
    <view class="header">
      <text>登录开启旅程</text>
      <Button class="login-btn" @tap="handleClick">登录/注册</Button>
    </view>
  </view>
  <view style="background-image: url('https://wl.wanghun.dpdns.org/uploads/2020031921552395638.jpg');" class="page-container" v-else>
    <!-- 头部区域 -->
    <view class="headerMain">
      <image class="avatar" :src="avatar" mode="aspectFill" @tap="handleUpdateAvatar" />
      <text class="username">{{ userStore.userInfo.userName || '未登录用户' }}</text>
    </view>

    <!-- 主体内容 -->
    <view class="main-content">
      <!-- 功能卡片网格布局 -->
      <view class="menu-grid">
        <view class="menu-card" @tap="handleMyTravelNotes">
          <text class="iconfont icon-note card-icon"></text>
          <text class="card-text">我的游记</text>
        </view>
        <view class="menu-card" @tap="handleMyFavorites">
          <text class="iconfont icon-favorite card-icon"></text>
          <text class="card-text">我的收藏</text>
        </view>
      </view>

      <!-- 单独提出的退出按钮 -->
      <view class="logout-wrapper">
        <button class="logout-btn" @tap="handleLogout">
          <text class="iconfont icon-exit"></text>
          退出登录
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import './index.scss'
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import { Button } from '@tarojs/components'
import { useUserStore } from '../../stores/index.js'

const userStore = useUserStore()
const token = userStore.token
const avatar = ref('')
if (userStore.userInfo.userAvatar) {
  avatar.value = 'https://wl.wanghun.dpdns.org' + userStore.userInfo.userAvatar
}

const handleClick = () => {
  Taro.reLaunch({
    url: '/pages/login/index'
  })
}

// 处理我的游记
const handleMyTravelNotes = () => {
  Taro.navigateTo({
    url: '/pages/travel-notes/index'
  })
}

// 处理我的收藏
const handleMyFavorites = () => {
  Taro.navigateTo({
    url: '/pages/favorites/index'
  })
}

// 处理退出登录
const handleLogout = () => {
  Taro.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.removeToken()
        Taro.reLaunch({ url: '/pages/index/index' })
      }
    }
  })
}

// 处理头像更新
const handleUpdateAvatar = () => {
  Taro.chooseMedia({
    count: 1,
    mediaType: ['image'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      uploadFile(res.tempFiles[0])
    }
  })
}

// 上传文件处理
const uploadFile = async (file) => {
  Taro.showLoading({ title: '上传中...' })

  try {
    const res = await Taro.uploadFile({
      url: 'https://wl.wanghun.dpdns.org/api/upload',
      filePath: file.tempFilePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${token}`
      }
    })
    const result = JSON.parse(res.data)
    if (result.data?.url) {
      const res = await Taro.request({
        url: 'https://wl.wanghun.dpdns.org/api/user/avatar',
        method: 'PATCH',
        data: {
          userAvatar: result.data.url
        },
        header: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = res.data.data.newData
      data.userAvatar = res.data.data.newAvatar
      userStore.setUserInfo(data)
      avatar.value = ''
      avatar.value = 'https://wl.wanghun.dpdns.org' + userStore.userInfo.userAvatar
      Taro.showToast({ title: '修改头像成功', icon: 'success' })
    }
  } catch (error) {
    Taro.showToast({ title: '上传失败', icon: 'none' })
    console.error('上传失败:', error)
  } finally {
    Taro.hideLoading()
  }
}

</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.header {
  background: linear-gradient(to right, #ff9800, #ff6d00);
  color: white;
  padding: 20px;
  text-align: center;
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;

  .login-btn {
    margin-top: 10px;
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    background-color: #ffffff;
    color: #ff6d00;
    font-weight: bold;
    font-size: 30rpx;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(255, 255, 255, 0.3);

    &:active {
      background-color: #fff3e0;
      transform: scale(0.96);
      color: #e65100;
    }
  }
}

.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.headerMain {
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    border: 4rpx solid #fff;
    margin-right: 40rpx;
    box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease;

    &:active {
      transform: scale(1.05);
    }
  }

  .username {
    color: #fff;
    font-size: 60rpx;
    font-weight: 700;
    font-weight: bold;
  }
}

.main-content {
  padding: 40rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
  margin-bottom: 60rpx;
}

.menu-card {
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.8);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.97);
    opacity: 0.9;
    box-shadow: 0 3rpx 6rpx rgba(0, 0, 0, 0.1);
  }

  .card-icon {
    font-size: 60rpx;
    color: #4a90e2;
    margin-bottom: 20rpx;
  }

  .card-text {
    font-size: 32rpx;
    color: #fff;
    font-weight: 500;
  }
}

.logout-wrapper {
  margin-top: auto;
  padding: 40rpx 0;

  .logout-btn {
    width: 100%;
    height: 100rpx;
    line-height: 100rpx;
    background: linear-gradient(to right, #ff4d4f, #ff7875);
    border-radius: 16rpx;
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    box-shadow: 0 6rpx 12rpx rgba(255, 77, 79, 0.3);
    transition: all 0.3s ease;

    &::after {
      border: none;
    }

    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }

    .iconfont {
      margin-right: 20rpx;
      font-size: 40rpx;
    }
  }
}
</style>
