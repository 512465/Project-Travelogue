<template>
  <view class="container">
    <view>
      <view>
        <AtSearchBar @clear="onClear" v-model:value="searchQuery" placeholder="搜索游记标题或作者昵称"
          @action-click="debouncedSearch" />
      </view>
    </view>
    <view class="waterfall-container">
      <view v-for="(item, index) in travelCards" :key="index" class="waterfall-item" @click="gotoDetail(item.id)">
        <image :src="item.travelogueCover" class="item-image" mode="aspectFill" />
        <view class="item-content">
          <text class="item-title">{{ item.travelogueTitle }}</text>
          <view class="user-info">
            <AtAvatar circle size="small" :image="item.authorAvatar || defaultAvatar" />
            <text class="user-name">{{ item.travelogueAuthor }}</text>
          </view>
        </view>
      </view>
    </view>
    <view v-if="loading" class="loading">加载中...</view>
  </view>
</template>

<script setup>
import './index.scss';
import { ref } from 'vue';
import { AtAvatar, AtSearchBar } from 'taro-ui-vue3';
import Taro from '@tarojs/taro';
import { getTravelogs, searchTravelogs } from '../../api/travelogue.js'

const travelCards = ref([]); // 存储游记卡片数据
const searchQuery = ref(''); // 搜索查询
const loading = ref(false); // 加载状态
const defaultAvatar = 'https://img.soogif.com/esrLXK1tXYDebZBHAKgmGx58EZd1smzH.jpeg_s400x0';

// 模拟分页加载函数
const loadTravelCards = async () => {
  // 这里应该替换为实际的 API 调用
  const res = await getTravelogs()
  console.log(res.data.items)
  const data = res.data.items; // 假设从 API 获取的数据
  travelCards.value.push(...data);
  loading.value = false;
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
const gotoDetail = (id) => {
  Taro.navigateTo({
    url: `/pages/travelDetail/index?id=${id}`
  });
};

// 页面加载时获取数据
loadTravelCards();

</script>
