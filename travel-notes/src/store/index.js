import { configureStore, createSlice } from '@reduxjs/toolkit';

// 辅助函数：从 localStorage 获取初始用户数据
const getInitialUser = () => {
  const storedUserData = localStorage.getItem('userData'); // 从 localStorage 读取 'userData'
  if (storedUserData) {
    try {
      // 尝试解析存储的用户数据
      return JSON.parse(storedUserData);
    } catch (e) {
      console.error("从 localStorage 解析用户数据时出错:", e);
      // 如果解析失败（例如，数据损坏），则移除它
      localStorage.removeItem('userData');
      return null;
    }
  }
  return null; // 未找到用户数据
};

// --- 用户认证状态切片 (authSlice) ---
const authSlice = createSlice({
  name: 'auth', // 切片名称
  initialState: {
    // 如果 localStorage 中存在 'token'，则 isLoggedIn 为 true
    isLoggedIn: !!localStorage.getItem('token'), // 使用 !! 确保得到布尔值
    // user 状态从 localStorage 中的 'userData' 初始化，如果未找到或无效则为 null
    user: getInitialUser(),
  },
  reducers: {
    // 用户通过表单成功登录时派发的 action
    login: (state, action) => {
      state.isLoggedIn = true; // 设置登录状态为 true
      // 使用 action.payload 中的数据填充 user 状态
      state.user = {
        adminId: action.payload.adminId,
        adminName: action.payload.adminName,
        adminAuth: action.payload.adminAuth,
        // 可以根据需要从 action.payload 中包含其他相关的用户详细信息
      };

      // 如果 action.payload 中提供了 access_token，则将其存储到 localStorage
      if (action.payload.access_token) {
        localStorage.setItem('token', action.payload.access_token);
        // console.log('Token 已保存到 localStorage:', action.payload.access_token);

        // 同时也将用户数据保存到 localStorage 以实现会话持久化
        // 创建一个仅包含必要用户详细信息的对象进行存储
        const userDataToStore = {
            adminId: action.payload.adminId,
            adminName: action.payload.adminName,
            adminAuth: action.payload.adminAuth,
        };
        localStorage.setItem('userData', JSON.stringify(userDataToStore));
        // console.log('用户数据已保存到 localStorage。');
      } else {
        // 理想情况下，如果登录成功并提供了 token，则不应发生此情况
        console.warn('派发 login action 时，payload 中没有 access_token。');
      }
    },
    // 用户登出时派发的 action
    logout: (state) => {
      state.isLoggedIn = false; // 设置登录状态为 false
      state.user = null; // 清空用户信息
      // 登出时从 localStorage 中移除 token 和用户数据
      localStorage.removeItem('token');
      localStorage.removeItem('userData'); // 确保也移除 userData
      // console.log('Token 和用户数据已从 localStorage 中移除。');
    },
    // 显式设置用户数据的 action (例如，在应用加载时从 API 获取数据后)
    setUser: (state, action) => {
        state.user = action.payload; // 使用 action.payload 更新 user 状态
        // 确保 isLoggedIn 状态反映用户数据和 token 的存在
        state.isLoggedIn = !!action.payload && !!localStorage.getItem('token');

        // 如果设置了用户数据 (例如，从 API 刷新)，也更新/确保 localStorage 中的 'userData' 保持一致
        if (action.payload) {
            const userDataToStore = { // 从 payload 中提取需要存储的数据
                adminId: action.payload.adminId,
                adminName: action.payload.adminName,
                adminAuth: action.payload.adminAuth,
            };
            localStorage.setItem('userData', JSON.stringify(userDataToStore));
        } else {
            // 如果 payload 为 null/undefined，则表示清除用户，因此也从 localStorage 中清除
            localStorage.removeItem('userData');
        }
    }
  },
});

// 导出 actions
export const { login, logout, setUser } = authSlice.actions;

// 创建并导出 store
const store = configureStore({
  reducer: {
    auth: authSlice.reducer, // 注册 auth reducer
  },
});

export default store;
