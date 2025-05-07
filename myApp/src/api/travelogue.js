import { get,patch,post } from "../utils/request";

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
  return patch(`/api/travelogue/travelogueViews/${id}`)
}

// 创建游记
export const publishTravelogue = (data) => {
  return post('/api/travelogue', data)
}

// 获取详细游记(编辑)
export const getTravelogueIdDetail = (id) => get(`/api/travelogue/${id}`);

// 编辑游记
export const editTravelogue = (id, data) => patch(`/api/travelogue/${id}`, data);
