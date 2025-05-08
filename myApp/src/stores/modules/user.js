import { defineStore } from 'pinia'
import { ref } from 'vue'
import { register, login } from '../../api/user'
import Taro from '@tarojs/taro'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('') // 登录凭证

    const setToken = (newToken) => {
      token.value = newToken
      // Taro.setStorageSync('token', newToken)
    }
    const removeToken = () => {
      token.value = ''
    }

    const userInfo = ref({}) // 用户信息

    const setUserInfo = (newUserInfo) => {
      userInfo.value = newUserInfo
      // Taro.setStorageSync('userInfo', newUserInfo)
    }

    return {
      token,
      userInfo,
      setToken,
      removeToken,
      setUserInfo,
    }
  },
  {
    persist: true
  },
)
