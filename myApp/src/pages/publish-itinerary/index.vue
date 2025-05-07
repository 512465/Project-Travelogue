<template>
  <view class="container">
    <view class="upload-section">
      <!-- 自定义上传区域 -->
      <view class="custom-uploader">
        <view class="file-list">
          <!-- 已上传文件列表 -->
          <view class="file-item" v-for="(item, index) in files" :key="index" @tap="handlePreview(index)">
            <image v-if="item.type === 'image'" :src="item.thumb" class="preview-image" mode="aspectFill" />
            <view v-else class="video-wrapper">
              <video :src="item.url" class="preview-video"></video>
              <view class="play-icon">▶</view>
            </view>
            <view class="delete-btn" @tap.stop="handleDelete(index)">×</view>
          </view>

          <!-- 添加按钮 -->
          <view class="add-btn" v-if="canAddMore" @tap="handleAddFile">
            <view class="plus">+</view>
          </view>
        </view>
      </view>
    </view>

    <view class="form-section">
      <view class="input-wrapper">
        <input v-model="title" class="input" placeholder="请输入标题" maxlength="20" @input="handleTitleInput" />
        <text class="counter">{{ remainingTitleCount }}/20</text>
      </view>
      <view class="input-wrapper">
        <textarea class="textarea" focus="true" v-model="content" height="200" :maxLength="200" placeholder="请输入内容"
          @input="handleContentInput" />
        <text class="counter">{{ remainingContentCount }}/200</text>
      </view>

    </view>

    <view class="agreement">
      <checkbox-group @change="onCheckChange">
        <checkbox :checked="checked" :value="checked.toString()" /> 同意《携程社区发布规则》
      </checkbox-group>
    </view>

    <view class="footer">
      <button class="publish-btn" :disabled="!checked" @tap="onPublish">发布</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import Taro from '@tarojs/taro'
import { useUserStore } from '../../stores/modules/user'
import { publishTravelogue } from '../../api/travelogue'

// 存储已上传文件（图片或视频）
const files = ref([])
const title = ref('')
const content = ref('')
const checked = ref(false)
const userStore = useUserStore()
// 封面
const travelogueCover = ref('')
//标题计算
const remainingTitleCount = computed(() => 20 - title.value.length)
// 内容计算
const remainingContentCount = computed(() => 200 - content.value.length)


// 是否还可以继续添加文件
const canAddMore = computed(() => {
  const videoCount = files.value.filter(f => f.type === 'video').length
  const imageCount = files.value.filter(f => f.type === 'image').length
  return videoCount <= 1 && imageCount < (videoCount === 1 ? 8 : 9)
})

// 添加文件（图片/视频）
const handleAddFile = async () => {
  try {
    const res = await Taro.chooseMedia({
      count: 9 - files.value.length,
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back'
    })

    const tempFiles = res.tempFiles

    for (const file of tempFiles) {
      await uploadFile(file)
    }
  } catch (error) {
    console.error('选择文件失败:', error)
  }
}

// 上传文件处理
const uploadFile = async (file) => {
  Taro.showLoading({ title: '上传中...' })

  if (!userStore.token) {
    Taro.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  try {
    const res = await Taro.uploadFile({
      url: 'https://travle.hub.feashow.cn/api/upload',
      filePath: file.tempFilePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${userStore.token}`
      }
    })

    const result = JSON.parse(res.data)
    if (result.data?.url) {
      const newFile = {
        type: file.fileType,
        url: 'https://travle.hub.feashow.cn' + result.data.url,
        thumb: file.fileType === 'image' ? file.tempFilePath : null
      }
      if (file.fileType === 'video') {
        const hasVideo = files.value.length > 0 && files.value[0].type === 'video'
        if (hasVideo) {
          Taro.showToast({ title: '只能上传一个视频', icon: 'none' })
          return
        }
        // 插入到第一个位置
        files.value.unshift(newFile)
      } else {
        // 图片逻辑：插入列表最后
        files.value.push(newFile)
      }
      Taro.showToast({ title: '上传成功', icon: 'success' })
    }
  } catch (error) {
    Taro.showToast({ title: '上传失败', icon: 'none' })
    console.error('上传失败:', error)
  } finally {
    Taro.hideLoading()
  }
}

// 删除文件
const handleDelete = (index) => {
  files.value.splice(index, 1)
  Taro.showToast({ title: '删除成功', icon: 'success' })
}

// 预览文件
const handlePreview = (index) => {
  const file = files.value[index]
  if (file.type === 'image') {
    Taro.previewImage({
      urls: files.value.filter((f) => f.type === 'image').map((f) => f.url),
      current: file.url
    })
  } else {
    Taro.previewMedia({
      sources: [
        {
          url: file.url,
          type: 'video'
        }
      ],
      current: 0
    })
  }
}

// 处理标题输入
const handleTitleInput = (e) => {
  title.value = e.detail.value
  if (remainingTitleCount.value <= 0) {
    Taro.showToast({
      title: '标题已达最大字数限制',
      icon: 'none',
      duration: 1500
    })
  }
}

const handleContentInput = (e) => {
  content.value = e.detail.value
  if (remainingContentCount.value <= 0) {
    Taro.showToast({
      title: '内容已达最大字数限制',
      icon: 'none',
      duration: 1500
    })
  }
}


// 修改后的协议勾选处理
const onCheckChange = (e) => {
  checked.value = e.detail.value.length > 0
}

const onPublish = async () => {
  if (!checked.value) {
    Taro.showToast({ title: '请勾选协议', icon: 'none' })
    return
  }

  if (!title.value || !content.value || files.value.length === 0) {
    Taro.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  Taro.showLoading({ title: '发布中...' })
  await publishTravelogue({
    travelogueTitle: title.value,
    travelogueContent: content.value,
    travelogueCover: files.value[0].url,
    travelogueImages: files.value
  }).then((res) => {
    Taro.hideLoading()
    Taro.showToast({ title: '发布成功', icon: 'success' })
    title.value = ''
    content.value = ''
    files.value = []
    setTimeout(() => {
      Taro.reLaunch({ url: '/pages/travel-notes/index' })
    }, 800);
  }).catch((err) => {
    Taro.hideLoading()
    Taro.showToast({ title: '发布失败', icon: 'none' })
  })
}
</script>

<style>
.container {
  padding: 20rpx;
  padding-bottom: 240rpx;
  /* 增加底部间距 */
}

.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  margin-bottom: 20rpx;
}

.file-item,
.add-btn {
  width: calc((100% - 40rpx) / 3);
  height: 220rpx;
  border-radius: 12rpx;
  position: relative;
  overflow: hidden;
}

.add-btn {
  border: 2rpx dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.plus {
  font-size: 48rpx;
  color: #666;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.video-wrapper {
  width: 100%;
  height: 100%;
  background: #000;
  position: relative;
}

.preview-video {
  width: 100%;
  height: 100%;
}

.play-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 60rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.delete-btn {
  position: absolute;
  right: 8rpx;
  top: 8rpx;
  width: 36rpx;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.input,
.textarea {
  width: auto;
  background: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  margin-bottom: 30rpx;
  border: 1px solid #d6e4ef;
}


.agreement {
  position: fixed;
  bottom: 130rpx;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background: #fff;
  z-index: 1;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.agreement checkbox {
  margin-right: 10rpx;
  transform: scale(0.9);
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.publish-btn {
  width: 100%;
  background: linear-gradient(to right, #00c6ff, #0072ff);
  color: #fff;
  padding: 16rpx 0;
  /* 减小按钮高度 */
  border-radius: 40rpx;
  /* 更圆润的按钮 */
  font-size: 28rpx;
  /* 减小字体大小 */
  line-height: 1.4;
}

.input-wrapper {
  position: relative;
  margin-bottom: 30rpx;
}

.counter {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  font-size: 24rpx;
  color: #999;
  background: rgba(255, 255, 255, 0.9);
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
}

.input {
  padding-right: 120rpx !important;
}

checkbox-group {
  display: flex;
  align-items: center;
}

checkbox {
  margin-right: 8rpx;
}
</style>
