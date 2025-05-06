import { get } from "../utils/request";

// 获取所有游记
export const getTravelogs = (data) => {
  const { page, limit, travelogueStatus, keyword } = data;
  // 构建基础的 URL
  let url = `/api/travelogue/list?page=${page}&limit=${limit}`;
  // 如果传入了 travelogueStatus，加入 URL 中
  if (travelogueStatus !== null) {
    url += `&travelogueStatus=${travelogueStatus}`;
  }
  // 如果传入了 keyword，加入 URL 中
  if (keyword) {
    url += `&keyword=${keyword}`;
  }
  // 返回 get 请求
  return get(url);
};

// 搜索游记
export const searchTravelogs = (keyword) => {
  return get(`/api/travelogue/list?keyword=${keyword}`)
}

// 获取游记详情
export const getTravelogueDetail = (id) => {
  return get(`/api/travelogue/${id}`)
}