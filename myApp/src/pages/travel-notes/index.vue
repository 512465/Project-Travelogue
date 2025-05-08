<template>
  <view class="container" v-if="travelListItems.length">
    <!-- 新增按钮 -->
    <view class="add-btn" @tap="handleAdd">
      <text class="icon-add">+</text>
    </view>

    <!-- 游记列表 -->
    <view class="travel-list">
      <view v-for="item in travelListItems" :key="item.travelogueId" class="travel-item">
        <image v-if="item.type" class="cover" :src="item.travelogueCover" mode="aspectFill" />
        <video v-else class="cover" :src="item.travelogueCover" />
        <view class="content" v-if="item.travelogueStatus != -1">
          <view class="title">{{ item.travelogueTitle }}</view>
          <view class="desc">{{ truncateContent(item.travelogueContent) }}</view>

          <view class="footer">
            <view class="status" :class="{
              'status-pass': item.travelogueStatus === 1,
              'status-pending': item.travelogueStatus === 0,
              'status-reject': item.travelogueStatus === -1
            }">
              {{ getStatusText(item.travelogueStatus) }}
            </view>
            <view class="actions">
              <view class="btn edit-btn" @tap="handleEdit(item.travelogueId)">编辑</view>
              <view class="btn delete-btn" @tap="handleDelete(item.travelogueId)">删除</view>
            </view>
          </view>
        </view>
        <view class="content" v-else>
          <view class="title">{{ item.travelogueTitle }}</view>
          <view class="desc">{{ truncateContent(item.travelogueRejectReason) }}</view>

          <view class="footer">
            <view class="status" :class="{
              'status-pass': item.travelogueStatus === 1,
              'status-pending': item.travelogueStatus === 0,
              'status-reject': item.travelogueStatus === -1
            }">
              {{ getStatusText(item.travelogueStatus) }}
            </view>
            <view class="actions">
              <!-- <view class="btn edit-btn" @tap="handleEdit(item.travelogueId)">编辑</view> -->
              <view class="btn delete-btn" @tap="handleDelete(item.travelogueId)">删除</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
  <view v-else class="empty">
    <view class="empty-content">
      <image class="empty-icon" src="../../assets/2020031921552395638.jpg" mode="aspectFit" />
      <view class="empty-text">
        <view class="empty-title">还没有游记哦～</view>
        <view class="empty-subtitle">去记录你的旅行故事吧</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useUserStore } from '../../stores/modules/user'

const travelListItems = ref([])
const userStore = useUserStore()

const getTravelogs = async () => {
  try {
    const res = await Taro.request({
      url: 'http://175.24.138.67:8586/api/travelogue',
      method: 'GET',
      header: {
        Authorization: `Bearer ${userStore.token}`
      }
    })
    console.log(res)
    travelListItems.value = res.data.data.items.map((item) => {
      return {
        ...item,
        type: isImage(item.travelogueCover)
      }
    })
  } catch (error) {
    console.error(error)
  }
}

// 是否为图片
const isImage = (url) => {
  return /\.(jpg|jpeg|png|gif|bmp)$/.test(url)
}

onMounted(() => {
  getTravelogs()
})

// 内容截断
const truncateContent = (text) => {
  console.log(text)
  return text.length > 20 ? text.substring(0, 20) + '...' : text
}

// 状态文本
const getStatusText = (travelogueStatus) => {
  return {
    1: '已通过',
    0: '待审核',
    [-1]: '被拒绝'
  }[travelogueStatus]
}

// 新增游记
const handleAdd = () => {
  Taro.reLaunch({ url: '/pages/publish-itinerary/index' })
}

// 编辑游记
const handleEdit = (id) => {
  Taro.reLaunch({ url: `/pages/edit/index?id=${id}` })
}

// 删除游记
const handleDelete = (id) => {
  Taro.showModal({
    title: '确认删除',
    content: '确定要删除这篇游记吗？',
    async success(res) {
      if (res.confirm) {
        await Taro.request({
          url: `http://175.24.138.67:8586/api/travelogue/${id}`,
          method: 'DELETE',
          header: {
            Authorization: `Bearer ${userStore.token}`
          }
        })
        Taro.showToast({ title: '删除成功', icon: 'success' })
        getTravelogs()
      }
    }
  })
}
</script>

<style lang="scss">
.container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.add-btn {
  position: fixed;
  right: 20px;
  bottom: 100px;
  z-index: 10;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #07c160;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .icon-add {
    color: white;
    font-size: 28px;
    line-height: 1;
    margin-top: -2px;
  }
}

.travel-list {
  margin-top: 30px;
}

.travel-item {
  display: flex;
  background: white;
  border-radius: 8px;
  margin-bottom: 15px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .cover {
    width: 300px;
    height: 300px;
    border-radius: 6px;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .title {
    font-size: 30rpx;
    color: #333;
    font-weight: 700;
    margin-bottom: 6px;
  }

  .desc {
    font-size: 30rpx;
    color: #666;
    line-height: 1.4;
    margin-bottom: 12px;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status {
    font-size: 30px;
    padding: 4px 8px;
    border-radius: 4px;

    &.status-pass {
      background: #e7f6e9;
      color: #07c160;
    }

    &.status-pending {
      background: #fff7e6;
      color: #ff9900;
    }

    &.status-reject {
      background: #ffece8;
      color: #ff4d4f;
    }
  }

  .actions {
    display: flex;
    gap: 10px;

    .btn {
      font-size: 30px;
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid #ddd;

      &.edit-btn {
        color: #333;
        border-color: #ccc;
      }

      &.delete-btn {
        color: #ff4d4f;
        border-color: #ffa39e;
      }
    }
  }
}

.empty {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;

  &-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translateY(-30%);
  }

  &-icon {
    width: 600px;
    height: 600px;
    margin-bottom: 40px;
    opacity: 0.8;
  }

  &-text {
    text-align: center;
  }

  &-title {
    font-size: 34px;
    color: #666;
    margin-bottom: 16px;
  }

  &-subtitle {
    font-size: 28px;
    color: #999;
  }
}
</style>
