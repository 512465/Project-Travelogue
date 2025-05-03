<template>
  <view class="container">
    <view class="search-bar">
      <input type="text" placeholder="搜索游记标题或作者昵称" v-model="searchQuery" @input="handleSearch" />
    </view>
    <view class="travel-cards">
      <view v-for="(item, index) in filteredTravelCards" :key="index" class="travel-card" @click="gotoDetail(item.id)">
        <image :src="item.travelogueCover" class="card-image" />
        <view class="card-content">
          <text class="card-title">{{ item.travelogueTitle }}</text>
          <view class="user-info">
            <AtAvatar circle size="2" image='https://img.soogif.com/esrLXK1tXYDebZBHAKgmGx58EZd1smzH.jpeg_s400x0' />
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
import { ref, computed } from 'vue';
import { AtAvatar } from 'taro-ui-vue3';
import Taro from '@tarojs/taro';
import { getTravelogs,searchTravelogs } from '../../api/travelogue.js'

const travelCards = ref([]); // 存储游记卡片数据
const searchQuery = ref(''); // 搜索查询
const url = ref('https://jdc.jd.com/img/200')
const loading = ref(false); // 加载状态

// 模拟分页加载函数
const loadTravelCards = async (page, limit) => {
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
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// 执行搜索逻辑
const performSearch = async () => {
  if (searchQuery.value) {
    loading.value = true;
    const res = await searchTravelogs(searchQuery.value);
    console.log(res)
    // travelCards.value = res.data.items; // 假设从 API 获取的数据
    loading.value = false;
  } else {
    // 如果搜索框为空，重新加载所有数据
    loadTravelCards(1, 10);
  }
};

// 防抖搜索
const debouncedSearch = debounce(performSearch, 300);

// 计算属性，根据搜索查询过滤游记卡片
const filteredTravelCards = computed(() => {
  return travelCards.value.filter(card => {
    return card.travelogueTitle.includes(searchQuery.value) || card.userName.includes(searchQuery.value);
  });
});

// 跳转到详情页
const gotoDetail = (id) => {
  Taro.navigateTo({
    url: `/pages/travelDetail/index?id=${id}`
  });
};

// 页面加载时获取数据
loadTravelCards(1, 10);

</script>


