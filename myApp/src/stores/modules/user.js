import { defineStore } from 'pinia'
import { ref } from 'vue'
import { register, login } from '../../api/user'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('') // 登录凭证

    const setToken = (newToken) => {
      token.value = newToken
    }
    const removeToken = () => {
      token.value = ''
    }

    const userInfo = ref({}) // 用户信息

    const setUserInfo = (newUserInfo) => {
      userInfo.value = newUserInfo
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
    persist: {
      // 持久化配置
      enabled: true,
      strategies: [
        {
          storage: localStorage,
          paths: ['userInfo', 'token'], // 明确持久化字段
        },
      ],
    },
  },
)
