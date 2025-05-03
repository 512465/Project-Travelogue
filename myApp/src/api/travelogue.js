import { get } from "../utils/request";

// 获取所有游记
export const getTravelogs = () => {
  return get('/api/travelogue/list')
}

// 搜索游记
export const searchTravelogs = ({  travelogueTitle, travelogueAuthor }) => {
  return get(`/api/travelogue/list?travelogueTitle=${travelogueTitle}&travelogueAuthor=${travelogueAuthor}`)
}