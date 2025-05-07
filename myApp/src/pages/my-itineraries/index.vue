<template>
  <view class="container" v-if="!userStore.token">
    <view class="header">
      <text>登录开启旅程</text>
      <Button class="login-btn" @tap="handleClick">登录/注册</Button>
    </view>
  </view>
  <view class="page-container" v-else>
    <!-- 头部区域 -->
    <view class="headerMain">
      <image class="avatar" :src="avatar" mode="aspectFill" @tap="handleUpdateAvatar" />
      <text class="username">{{ userStore.userInfo.userName || '未登录用户' }}</text>
    </view>

    <!-- 主体内容 -->
    <view class="main-content">
      <button class="menu-btn" @tap="handleMyTravelNotes">
        <text class="iconfont icon-note"></text>
        我的游记
      </button>
      <button class="menu-btn logout-btn" @tap="handleLogout">
        <text class="iconfont icon-exit"></text>
        退出登录
      </button>
    </view>

    <!-- 底部信息 -->
    <view class="footer">
      <text>欢迎来到旅行日记</text>
    </view>
  </view>
</template>

<script setup>
import './index.scss'
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { Button, Image } from '@tarojs/components'
import { useUserStore } from '../../stores/index.js'

const userStore = useUserStore()
const token = userStore.token
console.log(userStore.token)
console.log(userStore.userInfo)
const avatar = ref('')
if (userStore.userInfo.userAvatar) {
  avatar.value = 'https://travle.hub.feashow.cn' + userStore.userInfo.userAvatar
}
console.log(avatar.value)

const handleClick = () => {
  console.log('handleClick')
  Taro.navigateTo({
    url: '/pages/login/index'
  })
}

// 处理我的游记
const handleMyTravelNotes = () => {
  console.log('我的游记')
  Taro.navigateTo({
    url: '/pages/travel-notes/index'
  })
}

// 处理退出登录
const handleLogout = () => {
  console.log('退出登录')
  Taro.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.removeToken()
        Taro.reLaunch({ url: '/pages/index/index' })
      }
      console.log(res)
    }
  })
}

// 处理头像更新
const handleUpdateAvatar = () => {
  console.log('更新头像')
  Taro.chooseMedia({
    count: 1,
    mediaType: ['image'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // const tempFilePath = res.tempFiles[0].tempFilePath
      // userStore.updateAvatar(tempFilePath)
      uploadFile(res.tempFiles[0])
      console.log(res)
    }
  })
}

// 上传文件处理
const uploadFile = async (file) => {
  Taro.showLoading({ title: '上传中...' })

  try {
    const res = await Taro.uploadFile({
      url: 'https://travle.hub.feashow.cn/api/upload',
      filePath: file.tempFilePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${token}`
      }
    })
    console.log(res)
    const result = JSON.parse(res.data)
    if (result.data?.url) {
      console.log(result.data.url, 1324978454132)
      const res = await Taro.request({
        url: 'https://travle.hub.feashow.cn/api/user/avatar',
        method: 'PATCH',
        data: {
          userAvatar: result.data.url
        },
        header: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log(res, 1324978454132)
      const data = res.data.data.newData
      data.userAvatar = res.data.data.newAvatar
      userStore.setUserInfo(data)
      avatar.value = ''
      avatar.value = 'https://travle.hub.feashow.cn' + userStore.userInfo.userAvatar
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
  background: linear-gradient(to bottom, #4a90e2, #1a73e8);
  padding: 20px;
}

.header {
  background: linear-gradient(to right, #ff9800, #ff6d00);
  color: white;
  padding: 20px;
  text-align: center;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;

  .login-btn,
  .check-order {
    margin-top: 10px;
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .login-btn {
    background-color: #ff9800;
    color: white;

    &:hover {
      background-color: #ff6d00;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  .check-order {
    background-color: transparent;
    border: 1px solid white;
    color: white;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
}

.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.headerMain {
  padding: 60rpx 40rpx;
  background-color: #4a90e2;
  display: flex;
  align-items: center;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    border: 4rpx solid #fff;
    margin-right: 40rpx;
  }

  .username {
    color: #fff;
    font-size: 36rpx;
    font-weight: bold;
  }
}

.main-content {
  flex: 1;
  padding: 40rpx;

  .menu-btn {
    width: 100%;
    height: 100rpx;
    line-height: 100rpx;
    margin: 30rpx 0;
    background-color: #fff;
    border-radius: 16rpx;
    font-size: 32rpx;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;

    &::after {
      border: none;
    }

    &:active {
      opacity: 0.8;
      transform: scale(0.98);
    }

    .iconfont {
      margin-right: 20rpx;
      font-size: 40rpx;
    }
  }

  .logout-btn {
    color: #ff4d4f;
    margin-top: 80rpx;
  }
}

.footer {
  text-align: center;
  padding: 40rpx;
  color: #666;
  font-size: 28rpx;
  background-color: #fff;
}
</style>
