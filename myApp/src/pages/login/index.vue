<template>
  <view class="container">
    <view class="mode-switch">
      <button :class="['mode-btn', isLogin ? 'active' : '']" @tap="toggleMode(true)">
        登录
      </button>
      <button :class="['mode-btn', !isLogin ? 'active' : '']" @tap="toggleMode(false)">
        注册
      </button>
    </view>

    <Form class="form" @submit="handleSubmit">
      <input v-model="formData.userName" class="input" placeholder="请输入用户名" name="userName" />
      <input v-model="formData.userPassword" type="password" class="input" placeholder="请输入密码" password="true"
        name="userPassword" />
      <input v-if="!isLogin" v-model="formData.userPasswordConfirm" type="password" class="input" placeholder="请确认密码"
        password="true" name="userPasswordConfirm" />
      <button class="submit-btn" form-type="submit" :loading="isSubmitting">
        {{ isLogin ? '登录' : '注册' }}
      </button>
    </Form>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Taro from '@tarojs/taro'
import { Form, Input } from '@tarojs/components'
import { register, login, getUserInfo } from '../../api/user'
import { useUserStore } from '../../stores'

const isLogin = ref(true) // 默认登录模式
const isSubmitting = ref(false)
const formData = reactive({
  userName: '',
  userPassword: '',
  userPasswordConfirm: ''
})
const userStore = useUserStore()

// 切换登录/注册模式
const toggleMode = (login) => {
  isLogin.value = login
  // 清空表单数据
  Object.keys(formData).forEach(key => formData[key] = '')
}

// 表单提交处理
const handleSubmit = async () => {
  console.log('handleSubmit')
  console.log(formData)
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    // 基础验证
    if (!formData.userName.trim()) {
      throw '请输入用户名'
    }
    if (!formData.userPassword) {
      throw '请输入密码'
    }
    if (!isLogin.value && formData.userPassword !== formData.userPasswordConfirm) {
      throw '两次输入的密码不一致'
    }

    // 执行登录/注册操作
    const action = isLogin.value ? 'login' : 'register'
    console.log(action)
    if (action === 'login') {
      const res = await login({ userName: formData.userName, userPassword: formData.userPassword })
      console.log(res, 132465465)
      userStore.setToken(res.data.access_token)
      const user = await getUserInfo(res.data.userId)
      userStore.setUserInfo(user.data)
      if (res.success) {
        Taro.showToast({
          title: `${isLogin.value ? '登录' : '注册'}成功`,
          icon: 'success'
        })
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/index/index' })
          isSubmitting.value = false
        }, 1000);
      }
    } else {
      const res = await register({ userName: formData.userName, userPassword: formData.userPassword, userPasswordConfirm: formData.userPasswordConfirm })
      if (res.success) {
        Taro.showToast({
          title: `${isLogin.value ? '登录' : '注册'}成功`,
          icon: 'success'
        })
        isLogin.value = true
      }
    }
  } catch (err) {
    Taro.showToast({
      title: typeof err === 'string' ? err : '请求失败，请检查网络',
      icon: 'none',
      duration: 2000
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss">
.container {
  padding: 40rpx;
}

.mode-switch {
  display: flex;
  margin-bottom: 60rpx;
  border-radius: 16rpx;
  overflow: hidden;

  .mode-btn {
    flex: 1;
    background: #f5f5f5;
    color: #666;
    border-radius: 0;
    font-size: 32rpx;
    transition: all 0.3s;

    &::after {
      border: none;
    }

    &.active {
      background: #007aff;
      color: white;
    }
  }
}

.form {
  .input {
    background: #fff;
    border-radius: 12rpx;
    padding: 24rpx;
    font-size: 28rpx;
    margin-bottom: 40rpx;
    border: 1rpx solid #eee;

    &:focus {
      border-color: #007aff;
    }
  }
}

.submit-btn {
  margin-top: 60rpx;
  background: #007aff;
  color: white;
  border-radius: 12rpx;
  font-size: 32rpx;
  padding: 24rpx;

  &[loading] {
    opacity: 0.7;
  }
}
</style>