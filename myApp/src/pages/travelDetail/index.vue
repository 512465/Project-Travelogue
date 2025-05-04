<template>
  <view class="travel-detail-container">
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

    <!-- 内容展示 -->
    <template v-else>
      <image
        :src="detail.travelogueCover"
        mode="aspectFill"
        class="detail-cover"
      />

      <view class="content-wrapper">
        <text class="title">{{ detail.travelogueTitle }}</text>
        <!-- <text class="subtitle">{{ detail.subtitle }}</text> -->

        <view class="meta">
          <at-tag size="small">{{ detail.travelogueAuthor }}</at-tag>
          <at-tag size="small">{{ formatDate(detail.createTime) }}</at-tag>
        </view>

        <view class="content">
          {{ detail.travelogueContent }}
        </view>
      </view>

      <at-fab class="back-btn" @click="handleBack">
        <text class="at-fab__icon at-icon at-icon-chevron-left"></text>
      </at-fab>
    </template>
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
const id = ref(Taro.getCurrentInstance().router?.params?.id || '')

// 方法定义
const handleBack = () => Taro.navigateBack()

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

    // const res = await getTravelogueDetail(id.value)
    console.log(res, 23265)

    detail.value = res.data.data
    Taro.setNavigationBarTitle({ title: res.data.data.travelogueTitle })
  } catch (err) {
    error.value = '数据加载失败'
  } finally {
    loading.value = false
  }
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