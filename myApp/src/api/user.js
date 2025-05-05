import { get, post } from "../utils/request";

// 注册用户
export const register = (data) => post("/api/user", data);

// 登录用户
export const login = (data) => post("/api/auth-user/login", data);