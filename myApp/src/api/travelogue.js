import { get } from "../utils/request";

// 获取所有游记
export const getTravelogs = (page,limit) => {
  return get(`/api/travelogue/list?page=${page}&limit=${limit}`)
}

// 搜索游记
export const searchTravelogs = (keyword) => {
  return get(`/api/travelogue/list?keyword=${keyword}`)
}

// 获取游记详情
export const getTravelogueDetail = (id) => {
  return get(`/api/travelogue/${id}`)
}