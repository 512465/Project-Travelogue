<template>
  <view class="container">
    <view>
      <view>
        <AtSearchBar @clear="onClear" v-model:value="searchQuery" placeholder="搜索游记标题或作者昵称"
                     @action-click="debouncedSearch" />
      </view>
    </view>
    <view class="waterfall-container">
      <!-- 左列 -->
      <view class="waterfall-column" ref="leftColumn">
        <view v-for="(item, index) in leftItems" :key="item.travelogueId" class="waterfall-item"
              @tap="gotoDetail(item.travelogueId)">
          <image :src="item.travelogueCover || errorImage" class="item-image" mode="widthFix" />
          <view class="item-content">
            <text class="item-title">{{ item.travelogueTitle }}</text>
            <view class="user-info">
              <image class="avatar" :src="item.authorAvatar || defaultAvatar" />
              <text class="user-name">{{ item.travelogueAuthor }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 右列 -->
      <view class="waterfall-column" ref="rightColumn">
        <view v-for="(item, index) in rightItems" :key="item.travelogueId" class="waterfall-item"
              @tap="gotoDetail(item.travelogueId)">
          <image :src="item.travelogueCover || errorImage" class="item-image" mode="widthFix" />
          <view class="item-content">
            <text class="item-title">{{ item.travelogueTitle }}</text>
            <view class="user-info">
              <image class="avatar" :src="item.authorAvatar || defaultAvatar" />
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
import './index.scss';
import { ref, onMounted } from 'vue';
import { AtSearchBar } from 'taro-ui-vue3';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { getTravelogs, searchTravelogs } from '../../api/travelogue.js'
import loadingImg from '../../assets/loading.gif'
import errorImg from '../../assets/error.jpg'

const travelCards = ref([]); // 存储游记卡片数据
const searchQuery = ref(''); // 搜索查询
const loading = ref(false); // 加载状态
let page = 1; // 当前页数
const hasMore = ref(true); // 是否还有更多数据
const leftItems = ref([]); // 左列项目
const rightItems = ref([]); // 右列项目
const defaultAvatar = 'https://img.soogif.com/esrLXK1tXYDebZBHAKgmGx58EZd1smzH.jpeg_s400x0';
const loadingImage = loadingImg; // loading 占位图
const errorImage = errorImg; // 错误图像

// 2.用于计算每列的总高度
// 计算每列的总高度，假设每个 item 都有 height 属性
const getColumnHeight = (column) => {
  // 如果列为空，返回 0 高度
  if (column.length === 0) return 0;
  // 计算所有项的高度
  return column.reduce((acc, item) => acc + (item.height || 0), 0);
};

//将新卡片插入到较短的列中
const cardHeight = 300; // 假设每个卡片高度为 300px

const insertItemToColumn = (newItem) => {
  // 如果 newItem 没有 height 属性，给它赋一个默认高度
  if (!newItem.height) {
    newItem.height = cardHeight;  // 或者根据需要动态计算高度
  }

  // 获取当前两列的高度
  const leftHeight = getColumnHeight(leftItems.value);
  const rightHeight = getColumnHeight(rightItems.value);
  console.log(leftHeight, rightHeight);  // 打印当前高度

  // 将卡片插入到较低的列中
  if (leftHeight <= rightHeight) {
    leftItems.value.push(newItem);  // 将新卡片添加到左列
  } else {
    rightItems.value.push(newItem);  // 将新卡片添加到右列
  }
};

// 分页查询函数
const loadTravelCards = async (isRefresh = false) => {
  if (loading.value || (!hasMore.value && !isRefresh)) return;

  loading.value = true;
  if (isRefresh) {
    page = 1;
    hasMore.value = true;
    leftItems.value = [];  // 清空左列
    rightItems.value = []; // 清空右列
  }

  const res = await getTravelogs({
    page: page,
    limit: 10
  });

  const data = res.data.items;

  if (isRefresh) {
    travelCards.value = data; // 重置数据为新数据
  } else {
    travelCards.value.push(...data); // 新数据添加到已有数据
  }

  // 判断是否还有更多数据
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

  // 使用新的数据重新分配到两列
  distributeItemsToColumns();
};

// 切分数据为两列，按列高分配
const distributeItemsToColumns = () => {
  travelCards.value.forEach((item) => {
    // 如果没有 height 属性，设置默认值
    if (!item.height) {
      item.height = cardHeight;  // 或根据实际情况计算
    }
    insertItemToColumn(item);  // 将卡片插入较低的列
  });
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
  if (searchQuery.value) {
    loading.value = true;
    const res = await searchTravelogs(searchQuery.value);
    travelCards.value = res.data.items;
    loading.value = false;

    // 清空左列和右列
    leftItems.value = [];
    rightItems.value = [];

    distributeItemsToColumns();
  } else {
    loadTravelCards();
  }
};

// 防抖搜索
const debouncedSearch = debounce(performSearch, 300);

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

// 触底加载更多
useReachBottom(() => {
  console.log('触底加载更多');
  loadTravelCards();
});

// 页面加载时获取数据
onMounted(() => {
  loadTravelCards(true);
});
</script>
