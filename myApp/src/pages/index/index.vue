<template>
  <view class="container">
    <view>
      <AtSearchBar @clear="onClear" v-model:value="searchQuery" placeholder="搜索游记标题或作者昵称"
                   @action-click="debouncedSearch" />
    </view>
    <view v-if="skeletonLoading" class="skeleton-wrapper">
      <at-skeleton :types="{ 'card-6': 'card@6' }" type="card-6" />
    </view>
    <view v-else class="waterfall-container">
      <!-- 左列 -->
      <view class="waterfall-column-left" id="leftColumn">
        <view v-for="(item, index) in leftItems" :key="item.travelogueId" class="waterfall-item"
              @tap="gotoDetail(item.travelogueId)">
          <view v-if="item.isImage" class="item-image-wrapper fixed-height">
            <image :src="item.travelogueCover" class="item-image" mode="aspectFill" />
          </view>

          <view v-else class="video-wrapper">
            <video :src="item.travelogueCover" class="item-image" />
            <view class="video-mask" @click.stop.prevent></view>
          </view>
          <view class="item-content">
            <text class="item-title">{{ item.travelogueTitle }}</text>
            <view class="user-info">
              <view class="avatar-wrapper">
                <image class="avatar" :src="'https://wl.wanghun.dpdns.org' + item.userAvatar || defaultAvatar" />
                <text class="user-name">{{ item.travelogueAuthor }}</text>
              </view>
              <view class="views-count">
                <AtIcon value='eye' size='12'></AtIcon>
                <view>{{ item.travelogueViews }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="waterfall-column-right" id="rightColumn">
        <view v-for="(item, index) in rightItems" :key="item.travelogueId" class="waterfall-item"
              @tap="gotoDetail(item.travelogueId)">
          <view v-if="item.isImage" class="item-image-wrapper fixed-height">
            <image :src="item.travelogueCover" class="item-image" mode="aspectFill" />
          </view>

          <view v-else class="video-wrapper">
            <video :src="item.travelogueCover" class="item-image" />
            <view class="video-mask" @click.stop.prevent></view>
          </view>
          <view class="item-content">
            <text class="item-title">{{ item.travelogueTitle }}</text>
            <view class="user-info">
              <view class="avatar-wrapper">
                <image class="avatar" :src="'https://wl.wanghun.dpdns.org' + item.userAvatar || defaultAvatar" />
                <text class="user-name">{{ item.travelogueAuthor }}</text>
              </view>
              <view class="views-count">
                <AtIcon value='eye' size='12'></AtIcon>
                <view>{{ item.travelogueViews }}</view>
              </view>
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
import { AtSearchBar, AtIcon } from 'taro-ui-vue3'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { getTravelogs, searchTravelogs } from '../../api/travelogue.js'
import loadingImg from '../../assets/loading.gif'
import errorImg from '../../assets/error.jpg'
import { AtSkeleton } from 'taro-ui-vue3'

const travelCards = ref([])
const searchQuery = ref('')
const loading = ref(false)
const hasMore = ref(true)
const imageSizeCache = new Map()
let page = 1

const leftItems = ref([])
const rightItems = ref([])
const defaultAvatar = 'https://img.soogif.com/esrLXK1tXYDebZBHAKgmGx58EZd1smzH.jpeg_s400x0'
const errorImage = errorImg
const skeletonLoading = ref(true)

const skeletonTypes = {
  'two-column-cards': 'row[col[card@3], col[card@3]]'
}


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
  // 插入项到较矮的列
  await nextTick();
  const { leftHeight, rightHeight } = await getColumnHeights();

  if (leftHeight <= rightHeight) {
    leftItems.value.push(item);
  } else {
    rightItems.value.push(item);
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
    skeletonLoading.value = true
  }

  const res = await getTravelogs({ page, limit: 10 })
  const items = res.data.items.map((item) => {
    return {
      ...item,
      isImage: isImage(item.travelogueCover)
    }
  }) || []

  console.log('items', items)

  skeletonLoading.value = false
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


// 搜索相关逻辑
const performSearch = async () => {
  if (searchQuery.value) {
    loading.value = true
    const res = await searchTravelogs(searchQuery.value)
    const items = res.data.items || []

    travelCards.value = items || []

    if (items.length < 10) hasMore.value = false
    else page++

    await distributeItemsToColumns(items)

    loading.value = false

    leftItems.value = []
    rightItems.value = []
    await distributeItemsToColumns(travelCards.value)
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
