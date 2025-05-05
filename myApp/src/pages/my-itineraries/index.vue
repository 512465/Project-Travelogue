<template>
  <view class="index">
    <Counter />
    <AtButton type='primary' @click="handleClick">登录/注册</AtButton>
  </view>
</template>

<script setup>
import './index.scss'
import Counter from '../../components/Counter.vue'
import { AtButton } from 'taro-ui-vue3'
import Taro from '@tarojs/taro'

const handleClick = () => {
  console.log('handleClick')
  Taro.navigateTo({
    url: '/pages/login/index'
  })
}

</script>
