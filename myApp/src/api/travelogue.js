import { get } from "../utils/request";

// 获取所有游记
export const getTravelogs = () => {
  return get('/api/travelogue/list')
}

// 搜索游记
export const searchTravelogs = (keyword) => {
  return get(`/api/travelogue/list?keyword=${keyword}`)
}

// 获取游记详情
export const getTravelogueDetail = (id) => {
  return get(`/api/travelogue/${id}`)
}