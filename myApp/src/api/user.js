import { get, post } from "../utils/request";

// 注册用户
export const register = ({ userName, userPassword, userPasswordConfirm }) => post("/api/user", { userName, userPassword, userPasswordConfirm });

// 登录用户
export const login = ({ userName, userPassword }) => post("/api/auth-user/login", { userName, userPassword });

// 获取用户信息
export const getUserInfo = (id) => get(`/api/user/${id}`);