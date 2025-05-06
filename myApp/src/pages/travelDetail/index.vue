<template>
  <view class="travel-detail-container">
    <!-- 页面主体 -->
    <scroll-view scroll-y class="content-scroll">
      <!-- 加载状态 -->
      <view v-if="loading" class="custom-loading">
        <at-loading color="#6190E8" size="30" />
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 错误状态 -->
      <view v-else-if="error" class="custom-error">
        <at-icon name="close-circle" size="40" color="#FF4949" />
        <text class="error-text">{{ error }}</text>
        <at-button type="primary" @click="retry">重试</at-button>
      </view>

      <!-- 正文内容 -->
      <template v-else>
        <!-- 轮播图 -->
        <view class="swiper-wrapper">
          <swiper class="test-h" indicatorColor="#999" indicatorActiveColor="#333" :current="current"
                  :duration="duration" :interval="interval" circular autoplay indicatorDots @change="onSwiperChange">
            <swiper-item v-for="(item, idx) in imgUrls" :key="idx">
              <image :src="item" class="slide-image" />
            </swiper-item>
          </swiper>
          <view class="swiper-indicator">
            {{ current + 1 }}/{{ imgUrls.length }}
          </view>
        </view>

        <!-- 作者 -->
        <view class="author-info">
          <image :src="severUrl + detail.userAvatar || defaultAvatar" class="author-avatar" />
          <text class="author-name">{{ detail.travelogueAuthor }}</text>
        </view>

        <!-- 内容 -->
        <view class="content-wrapper">
          <text class="title">{{ detail.travelogueTitle }}</text>
          <view class="content">
            {{ detail.travelogueContent }}
          </view>
          <text class="edit-time">编辑于 {{ formatDate(detail?.updatedAt || detail?.updateTime) }}  |</text>
        </view>
      </template>
    </scroll-view>

    <!-- ✅ 固定底部操作栏 -->
    <view class="footer-info-fixed">
      <view class="interaction-bar">
        <view class="interaction-item">
          <at-icon value="heart" size="20" color="#666" />
          <text>{{ detail?.likeCount || 0 }}</text>
        </view>
        <view class="interaction-item">
          <at-icon value="star" size="20" color="#666" />
          <text>{{ detail?.favoriteCount || 0 }}</text>
        </view>
        <view class="interaction-item">
          <at-icon value="message" size="20" color="#666" />
          <text>{{ detail?.commentCount || 0 }}</text>
        </view>
      </view>
    </view>
  </view>
</template>


<script setup>
import './index.scss'
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
// import { getTravelogueDetail } from '../../api/travelogue.js'
import {
  AtLoading,
  AtIcon,
  AtButton,
  AtTag,
  AtFab
} from 'taro-ui-vue3'
// const id = ref(Taro.getCurrentInstance().router?.params?.id || '')
// console.log(id.value)
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJOYW1lIjoiVXNlcjEyMyIsImlhdCI6MTc0NjE3MTI5NiwiZXhwIjoxNzQ2Nzc2MDk2fQ.2MB5y7xB8AZC_vgebYbQguiipZQcB02AwYcF2ImSe9s'


// 响应式状态
const loading = ref(true)
const error = ref('')
const detail = ref(null)
const current = ref(0)
const duration = 500
const interval = 5000
const severUrl = 'http://localhost:3000'
const imgUrls = [
  'http://localhost:3000/uploads/9ec01d910eb95f0476e894622b87875c6cd62df87188b14f752344a8be751810.png',
  'http://localhost:3000/uploads/6062ff90c5baf81ea3b6768f10c706a16eedded7a1ea095a79fd7a354029fb74.png',
  'http://localhost:3000/uploads/4996b8ff888472570028606c8b2a3fcb9ecd7d8e82b92664cc3de50f8fab0fc8.png'
]
const id = ref(Taro.getCurrentInstance().router?.params?.id || '')

const formatDate = timestamp =>
  new Date(timestamp).toLocaleDateString()

const retry = async () => {
  loading.value = true
  error.value = ''
  await fetchData()
}


const fetchData = async () => {
  try {
    const res = await Taro.request({
      url: `http://127.0.0.1:3000/api/travelogue/${id.value}`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${token}`
      }
    })
    detail.value = res.data.data
    console.log(detail.value)
    Taro.setNavigationBarTitle({ title: res.data.data.travelogueTitle })
  } catch (err) {
    error.value = '数据加载失败'
  } finally {
    loading.value = false
  }
}

const onSwiperChange = (e) => {
  current.value = e.detail.current
}


// 生命周期
onMounted(() => {
  if (!id.value) {
    error.value = '无效的ID参数'
    loading.value = false
    return
  }
  fetchData()
})
</script>