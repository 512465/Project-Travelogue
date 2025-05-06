// src/utils/request.js
import Taro from '@tarojs/taro'
import { useUserStore } from '../stores/index'

const BASE_URL = 'http://127.0.0.1:3000' // 根据环境变量动态配置更佳

const request = async (method, url, data = {}, config = {}) => {
  // 合并配置
  const mergedConfig = {
    header: {
      'Content-Type': 'application/json',
      ...config.header,
    },
    ...config,
  }

  // 请求拦截器（例如：添加 Token）
  const userStore = useUserStore()
  const token = userStore.token
  if (token) {
    mergedConfig.header.Authorization = `Bearer ${token}`
  }

  // 显示加载提示
  Taro.showLoading({ title: '加载中...' })

  try {
    const response = await Taro.request({
      url: `${BASE_URL}${url}`,
      method: method.toUpperCase(),
      data,
      ...mergedConfig,
    })

    // 隐藏加载提示
    Taro.hideLoading()

    // 响应拦截器
    if (response.statusCode) {
      if (response.data.code) {
        return response.data
      }
    } else {
      throw new Error(`请求失败，状态码：${response.statusCode}`)
    }
  } catch (error) {
    Taro.hideLoading()
    Taro.showToast({ title: error.message || '网络错误', icon: 'none' })
    throw error
  }
}

// 封装常用方法
export const get = (url, params, config) => request('GET', url, params, config)
export const post = (url, data, config) => request('POST', url, data, config)
export const put = (url, data, config) => request('PUT', url, data, config)
export const del = (url, data, config) => request('DELETE', url, data, config)
export const patch = (url, data, config) => request('PATCH', url, data, config)