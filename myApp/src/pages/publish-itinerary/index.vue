<template>
  <view class="index">
    <Counter />
    <AtButton type='primary'>按钮文案</AtButton>
  </view>
</template>

<script>
import './index.scss'
import Counter from '../../components/Counter.vue'
import { AtButton } from 'taro-ui-vue3'

export default {
  name: 'Index',
  components: {
    Counter
  }
}
</script>
