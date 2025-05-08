import { configureStore } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

// 创建用户认证状态切片
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: localStorage.getItem('token') ? true : false,
    user: null,
  },
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      // 保存用户信息，包括adminAuth权限信息
      state.user = {
        adminId: action.payload.adminId,
        adminName: action.payload.adminName,
        adminAuth: action.payload.adminAuth,
      };
      if (action.payload.access_token) {
        // 确保token被正确保存到localStorage
        localStorage.setItem('token', action.payload.access_token);
        // 添加调试信息
        console.log('Token saved to localStorage:', action.payload.access_token);
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      localStorage.removeItem('token');
    },
  },
});

// 创建审核状态切片
const reviewSlice = createSlice({
  name: 'review',
  initialState: {
    reviews: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchReviewsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchReviewsSuccess: (state, action) => {
      state.reviews = action.payload;
      state.loading = false;
    },
    fetchReviewsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateReviewStatus: (state, action) => {
      const { id, status } = action.payload;
      const reviewIndex = state.reviews.findIndex((review) => review.id === id);
      if (reviewIndex !== -1) {
        state.reviews[reviewIndex].status = status;
      }
    },
  },
});

// 导出 actions
export const { login, logout } = authSlice.actions;
export const { fetchReviewsStart, fetchReviewsSuccess, fetchReviewsFailure, updateReviewStatus } = reviewSlice.actions;

// 创建 store
const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    review: reviewSlice.reducer,
  },
});

export default store;