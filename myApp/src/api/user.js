import { get, post, patch } from "../utils/request";

// 注册用户
export const register = ({ userName, userPassword, userPasswordConfirm }) => post("/api/user", { userName, userPassword, userPasswordConfirm });

// 登录用户
export const login = ({ userName, userPassword }) => post("/api/auth-user/login", { userName, userPassword });

// 获取用户信息
export const getUserInfo = (id) => get(`/api/user/${id}`);

// 更新用户头像
export const updateUserAvatar = (avatar) => patch(`/api/user/avatar`, { avatar });


// 获取个人游记详情
export const getTravelDetail = (data) => {
  const { page, limit, travelogueStatus, } = data;
  let url = `/api/travelogue/list?page=${page}&limit=${limit}`;
  // 如果传入了 travelogueStatus，加入 URL 中
  if (travelogueStatus !== null && travelogueStatus !== undefined) {
    url += `&travelogueStatus=${travelogueStatus}`;
  }
  return get(url);
};
