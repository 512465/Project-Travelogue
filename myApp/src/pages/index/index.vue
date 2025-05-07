<template>
  <view class="container">
    <view>
      <AtSearchBar @clear="onClear" v-model:value="searchQuery" placeholder="搜索游记标题或作者昵称"
        @action-click="debouncedSearch" />
    </view>
    <view class="waterfall-container">
      <!-- 左列 -->
      <view class="waterfall-column-left" id="leftColumn">
        <view v-for="(item, index) in leftItems" :key="item.travelogueId" class="waterfall-item"
          @tap="gotoDetail(item.travelogueId)">
          <view v-if="item.isImage" class="item-image-wrapper" :style="{
            paddingBottom: (item.travelogueCoverHeight && item.travelogueCoverWidth)
              ? (item.travelogueCoverHeight / item.travelogueCoverWidth * 100) + '%'
              : '100%'
          }">
            <image :src="item.travelogueCover" class="item-image" mode="aspectFill" @load="() => onImageLoad(item)" />
          </view>

          <view v-else class="video-wrapper">
            <video :src="item.travelogueCover" class="item-image" />
            <view class="video-mask" @click.stop.prevent></view>
          </view>
          <view class="item-content">
            <text class="item-title">{{ item.travelogueTitle }}</text>
            <view class="user-info">
              <image class="avatar" :src="'https://travle.hub.feashow.cn' + item.userAvatar || defaultAvatar" />
              <text class="user-name">{{ item.travelogueAuthor }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 右列 -->
      <view class="waterfall-column-right" id="rightColumn">
        <view v-for="(item, index) in rightItems" :key="item.travelogueId" class="waterfall-item"
          @tap="gotoDetail(item.travelogueId)">
          <view v-if="item.isImage" class="item-image-wrapper" :style="{
            paddingBottom: (item.travelogueCoverHeight && item.travelogueCoverWidth)
              ? (item.travelogueCoverHeight / item.travelogueCoverWidth * 100) + '%'
              : '100%'
          }">
            <image :src="item.travelogueCover" class="item-image" mode="aspectFill" @load="() => onImageLoad(item)" />
          </view>

          <view v-else class="video-wrapper">
            <video :src="item.travelogueCover" class="item-image" />
            <view class="video-mask" @click.stop.prevent></view>
          </view>
          <view class="item-content">
            <text class="item-title">{{ item.travelogueTitle }}</text>
            <view class="user-info">
              <image class="avatar" :src="'https://travle.hub.feashow.cn' + item.userAvatar || defaultAvatar" />
              <text class="user-name">{{ item.travelogueAuthor }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="loading" class="loading">加载中...</view>
    <view v-if="!hasMore" class="loading">没有更多数据了</view>
  </view>
</template>

<script setup>
import './index.scss'
import { ref, onMounted, nextTick } from 'vue'
import { AtSearchBar } from 'taro-ui-vue3'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { getTravelogs, searchTravelogs } from '../../api/travelogue.js'
import loadingImg from '../../assets/loading.gif'
import errorImg from '../../assets/error.jpg'

const travelCards = ref([])
const searchQuery = ref('')
const loading = ref(false)
const hasMore = ref(true)
let page = 1

const leftItems = ref([])
const rightItems = ref([])
const defaultAvatar = 'https://img.soogif.com/esrLXK1tXYDebZBHAKgmGx58EZd1smzH.jpeg_s400x0'
const errorImage = errorImg

// 判断是否为图片
const isImage = (url) => {
  return url && url.match(/\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)*$/i)
}

// 页面跳转
const gotoDetail = (travelogueId) => {
  Taro.navigateTo({
    url: `/pages/travelDetail/index?id=${travelogueId}`
  })
}

// 获取列高度
const getColumnHeights = () => {
  return new Promise((resolve) => {
    const query = Taro.createSelectorQuery()
    query.select('#leftColumn').boundingClientRect()
    query.select('#rightColumn').boundingClientRect()
    query.exec((res) => {
      const [left, right] = res
      resolve({
        leftHeight: left?.height || 0,
        rightHeight: right?.height || 0
      })
    })
  })
}

// 插入 item 到较矮列
const insertItemToColumn = async (item) => {
  item.isImage = isImage(item.travelogueCover)
  await nextTick()
  const { leftHeight, rightHeight } = await getColumnHeights()
  console.log(leftHeight, rightHeight)
  if (leftHeight <= rightHeight) {
    leftItems.value.push(item)
  } else {
    rightItems.value.push(item)
  }
}

// 分配多个卡片
const distributeItemsToColumns = async (items) => {
  for (const item of items) {
    await insertItemToColumn(item)
  }
}

// 数据加载
const loadTravelCards = async (isRefresh = false) => {
  if (loading.value || (!hasMore.value && !isRefresh)) return
  loading.value = true

  if (isRefresh) {
    page = 1
    hasMore.value = true
    travelCards.value = []
    leftItems.value = []
    rightItems.value = []
  }

  const res = await getTravelogs({ page, limit: 10 })
  const items = res.data.items || []
  if (isRefresh) {
    travelCards.value = items
  } else {
    travelCards.value.push(...items)
  }

  if (items.length < 10) hasMore.value = false
  else page++

  await distributeItemsToColumns(items)

  loading.value = false
  if (isRefresh) Taro.stopPullDownRefresh()
}

const imageLoadQueue = ref([])

const onImageLoad = async (item) => {
  if (!imageLoadQueue.value.includes(item.travelogueId)) {
    imageLoadQueue.value.push(item.travelogueId)

    // 获取原始图片宽高
    Taro.getImageInfo({
      src: item.travelogueCover,
      success(res) {
        item.travelogueCoverWidth = res.width
        item.travelogueCoverHeight = res.height
      },
      fail() {
        item.travelogueCoverWidth = 2
        item.travelogueCoverHeight = 3
      },
      complete: async () => {
        await insertItemToColumn(item)
      }
    })
  }
}



// 搜索相关逻辑
const performSearch = async () => {
  if (searchQuery.value) {
    loading.value = true
    const res = await searchTravelogs(searchQuery.value)
    travelCards.value = res.data.items || []
    leftItems.value = []
    rightItems.value = []
    await distributeItemsToColumns()
    loading.value = false
  } else {
    loadTravelCards(true)
  }
}

const debounce = (fn, delay) => {
  let timer
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

const debouncedSearch = debounce(performSearch, 300)

const onClear = () => {
  searchQuery.value = ''
  loadTravelCards(true)
}

// 下拉刷新和触底加载
usePullDownRefresh(() => loadTravelCards(true))
useReachBottom(() => loadTravelCards())

// 页面加载
onMounted(() => {
  loadTravelCards(true)
})
</script>
