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
          <swiper class="test-h" :style="{ height: swiperHeight + 'px' }" indicatorColor="#999"
                  indicatorActiveColor="#333" :current="current" :duration="duration" :interval="interval"
                  circular="true" autoplay="true" indicatorDots="true" @change="onSwiperChange">
            <swiper-item v-for="(item, idx) in imgs" :key="idx">
              <view v-if="item.type === 'video'" @tap="playVideo(item)"
                    style="height: 100%; display: flex; align-items: center;">
                <video :src="item.url" id="myVideo" controls class="slide-video" />
              </view>
              <view v-else @tap="viewImage(item.url)" style="height: 100%; display: flex; align-items: center;">
                <image :src="item.url" class="slide-image" mode="widthFix" @load="onImageLoad" />
              </view>
            </swiper-item>
          </swiper>
          <view class="swiper-indicator">
            {{ current + 1 }}/{{ imgs.length }}
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
          <text class="edit-time">编辑于 {{ formatDate(detail?.updatedAt || detail?.updateTime) }} |</text>
        </view>
      </template>
    </scroll-view>

    <!-- ✅ 固定底部操作栏 -->
    <view class="footer-info-fixed" :style="{ pointerEvents: loading ? 'none' : 'auto', opacity: loading ? 0.5 : 1 }">
      <view class="interaction-bar">
        <view class="interaction-item">
          <Button openType="share" class="share-btn">
            <at-icon openType="share" value="external-link" size="20" color="#666" />
          </Button>
        </view>
        <view class="interaction-item" @tap="handleLike">
          <at-icon v-if="!isLike" value="heart" size="20" color="#666" />
          <at-icon v-else value="heart-2" size="20" color="red" />
          <text>{{ detail?.travelogueLikes || 0 }}</text>
        </view>
        <view class="interaction-item" @tap="handleCollect">
          <at-icon v-if="!isCollects" value="star" size="20" color="#666" />
          <at-icon v-else value="star-2" size="20" color="red" />
          <text>{{ detail?.travelogueCollects || 0 }}</text>
        </view>
      </view>
    </view>
  </view>
</template>


<script setup>
import './index.scss'
import { ref, onMounted } from 'vue'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { useUserStore } from '../../stores/modules/user'
import {
  AtLoading,
  AtIcon,
  AtButton,
  AtTag,
  AtFab
} from 'taro-ui-vue3'
import { getTravelogueDetail, isCollectSever, isLikeSever } from '../../api/travelogue'
import { getUserInfo } from '../../api/user'

const userStore = useUserStore()
// 响应式状态
const loading = ref(true)
const error = ref('')
const detail = ref(null)
const current = ref(0)
const duration = 500
const interval = 5000
const imgs = ref([])
const severUrl = 'https://wl.wanghun.dpdns.org'
const isLike = ref(false)
const isCollects = ref(false)
const id = ref(Taro.getCurrentInstance().router?.params?.id || '')
const swiperHeight = ref(300) // 初始值，单位是 px

// 用于记录当前最大高度
let maxHeight = 0

const formatDate = timestamp =>
  new Date(timestamp).toLocaleDateString()

const retry = async () => {
  loading.value = true
  error.value = ''
  await fetchData()
}


const fetchData = async () => {
  try {
    const res = await getTravelogueDetail(id.value);
    detail.value = res.data
    imgs.value = detail.value.travelogueImages.map((item) => {
      return {
        url: item.url,
        type: item.type
      }
    })
    Taro.setNavigationBarTitle({ title: res.data.travelogueTitle })
  } catch (err) {
    console.error(err)
    error.value = '数据加载失败'
  } finally {
    loading.value = false
  }
}

const onSwiperChange = (e) => {
  current.value = e.detail.current
}

// 视频点击处理方法
const playVideo = (item) => {
  if (item.type === 'video') {
    Taro.previewMedia({
      sources: [
        {
          url: item.url,
          type: 'video'
        }
      ],
      current: 0
    })
  }
}


// 图片点击查看方法
const viewImage = (url) => {
  Taro.previewImage({
    current: url,  // 当前显示的图片链接
    urls: imgs.value.map(item => item.url)  // 所有图片的链接
  })
}

const handleLike = () => {
  isLike.value = !isLike.value
  if (isLike.value) {
    detail.value.travelogueLikes += 1
    Taro.showToast({ title: '点赞成功', icon: 'success' })
  } else {
    detail.value.travelogueLikes -= 1
    Taro.showToast({ title: '取消点赞', icon: 'none' })
  }
  isLikeSever(id.value)
}

const handleCollect = () => {
  isCollects.value = !isCollects.value
  if (isCollects.value) {
    detail.value.travelogueCollects += 1
    Taro.showToast({ title: '收藏成功', icon: 'success' })
  } else {
    detail.value.travelogueCollects -= 1
    Taro.showToast({ title: '取消收藏', icon: 'none' })
  }
  isCollectSever(id.value)
}

useShareAppMessage(() => {
  return {
    title: detail.value?.travelogueTitle || '精彩游记',
    path: `/pages/travel-detail/index?id=${id.value}`,
    imageUrl: imgs.value[0]?.url || ''  // 分享缩略图
  }
})

// 图片加载后获取实际高度
const onImageLoad = (e) => {
  const { width, height } = e.detail
  const screenWidth = Taro.getSystemInfoSync().windowWidth
  const scale = screenWidth / width
  const realHeight = height * scale

  if (realHeight > maxHeight) {
    maxHeight = realHeight
    swiperHeight.value = maxHeight
  }
}
// 生命周期
onMounted(async () => {
  if (!id.value) {
    error.value = '无效的ID参数'
    loading.value = false
    return
  }
  const res = await getUserInfo(userStore.userInfo.userId)
  isLike.value = Array.isArray(res.data.userLikes) ? res.data.userLikes.includes(Number(id.value)) : false;
  isCollects.value = Array.isArray(res.data.userCollects) ? res.data.userCollects.includes(Number(id.value)) : false;
  fetchData()
})
</script>
