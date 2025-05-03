<template>
  <view class="container">
    <view class="search-bar">
      <input type="text" placeholder="搜索游记标题或作者昵称" v-model="searchQuery" @input="handleSearch" />
    </view>
    <view class="travel-cards">
      <view v-for="(item, index) in filteredTravelCards" :key="index" class="travel-card" @click="gotoDetail(item.id)">
        <image :src="item.image" class="card-image" />
        <view class="card-content">
          <text class="card-title">{{ item.title }}</text>
          <view class="user-info">
            <image :src="item.userAvatar" class="user-avatar" />
            <text class="user-name">{{ item.userName }}</text>
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
import Taro from '@tarojs/taro';

const travelCards = ref([]); // 存储游记卡片数据
const searchQuery = ref(''); // 搜索查询
const loading = ref(false); // 加载状态

// 模拟分页加载函数
const loadTravelCards = async (page, limit) => {
  // 这里应该替换为实际的 API 调用
  const data = []; // 假设从 API 获取的数据
  travelCards.value.push(...data);
  loading.value = false;
};

// 处理搜索
const handleSearch = () => {
  // 这里可以添加防抖逻辑
  // 执行搜索逻辑，例如调用 API 获取搜索结果
};

// 计算属性，根据搜索查询过滤游记卡片
const filteredTravelCards = computed(() => {
  return travelCards.value.filter(card => {
    return card.title.includes(searchQuery.value) || card.userName.includes(searchQuery.value);
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


