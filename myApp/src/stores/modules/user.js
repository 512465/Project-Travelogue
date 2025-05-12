import { defineStore } from 'pinia'
import { ref } from 'vue'
import { register, login } from '../../api/user'
import Taro from '@tarojs/taro'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('') // 登录凭证
    const userInfo = ref({}) // 用户信息

    const setToken = (newToken) => {
      token.value = newToken
      // Taro.setStorageSync('token', newToken)
    }

    const setUserInfo = (newUserInfo) => {
      userInfo.value = newUserInfo
    }

    const removeToken = () => {
      token.value = ''
      userInfo.value = {}
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
