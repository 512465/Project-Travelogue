<template>
  <view class="container">
    <view>
      <view>
        <AtSearchBar @clear="onClear" v-model:value="searchQuery" placeholder="搜索游记标题或作者昵称"
          @action-click="debouncedSearch" />
      </view>
    </view>
    <view class="waterfall-container">
      <view v-for="(item, index) in travelCards" :key="index" class="waterfall-item"
        @tap="gotoDetail(item.travelogueId)">
        <image :src="item.travelogueCover" class="item-image" mode="widthFix" />
        <view class="item-content">
          <text class="item-title">{{ item.travelogueTitle }}</text>
          <view class="user-info">
            <image class="avatar" :src="item.authorAvatar || defaultAvatar" />
            <text class="user-name">{{ item.travelogueAuthor }}</text>
          </view>
        </view>
      </view>
    </view>
    <view v-if="loading" class="loading">加载中...</view>
    <view v-if="!hasMore" class="loading">没有更多数据了</view>
  </view>

</template>

<script setup>
import './index.scss';
import { ref, onMounted } from 'vue';
import { AtSearchBar } from 'taro-ui-vue3';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { getTravelogs, searchTravelogs } from '../../api/travelogue.js'

const travelCards = ref([]); // 存储游记卡片数据
const searchQuery = ref(''); // 搜索查询
const loading = ref(false); // 加载状态
let page = 1; // 当前页数
const hasMore = ref(true); // 是否还有更多数据
const defaultAvatar = 'https://img.soogif.com/esrLXK1tXYDebZBHAKgmGx58EZd1smzH.jpeg_s400x0';


// 分页查询函数
const loadTravelCards = async (isRefresh = false) => {
  if (loading.value || !hasMore.value && !isRefresh) return;

  loading.value = true;
  if (isRefresh) {
    page = 1;
    hasMore.value = true;
  }

  const res = await getTravelogs({
    page: page,
    limit: 10
  });

  const data = res.data.items;

  if (isRefresh) {
    travelCards.value = data;
  } else {
    travelCards.value.push(...data);
  }

  // 判断是否还有更多
  if (data.length < 10) {
    hasMore.value = false;
  } else {
    page++;
  }

  loading.value = false;

  // 结束下拉刷新动画
  if (isRefresh) {
    Taro.stopPullDownRefresh();
  }
};


// 防抖函数
const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// 执行搜索逻辑
const performSearch = async () => {
  console.log(searchQuery.value)
  if (searchQuery.value) {
    loading.value = true;
    const res = await searchTravelogs(searchQuery.value);
    console.log(res)
    travelCards.value = res.data.items; // 假设从 API 获取的数据
    loading.value = false;
  } else {
    // 如果搜索框为空，重新加载所有数据
    loadTravelCards();
  }
};

// 防抖搜索
const debouncedSearch = debounce(performSearch, 300);

// 计算属性，根据搜索查询过滤游记卡片
// const filteredTravelCards = () => {
//   return travelCards.value.filter(card => {
//     const titleIncludes = card.travelogueTitle ? card.travelogueTitle.includes(searchQuery.value) : false;
//     const userIncludes = card.travelogueAuthor ? card.travelogueAuthor.includes(searchQuery.value) : false;
//     return titleIncludes || userIncludes;
//   });
// };

const onClear = () => {
  searchQuery.value = '';
  loadTravelCards();
}


// 跳转到详情页
const gotoDetail = (travelogueId) => {
  console.log(travelogueId)
  Taro.navigateTo({
    url: `/pages/travelDetail/index?id=${travelogueId}`
  });
};

// 下拉刷新
usePullDownRefresh(() => {
  console.log('下拉刷新');
  loadTravelCards(true);
});


// 触底更多
useReachBottom(() => {
  console.log('触底加载更多');
  loadTravelCards();
});

// 页面加载时获取数据
onMounted(() => {
  const user = Taro.getStorageSync('user')
  console.log(user)
  loadTravelCards();
});

</script>
