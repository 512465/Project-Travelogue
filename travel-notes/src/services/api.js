import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3000', // 后端服务地址
  timeout: 10000, // 请求超时时间
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 用户相关API
export const userApi = {
  // 注册
  register: (data) => api.post('/api/admin', data),
  // 登录
  login: (data) => api.post('/api/auth-admin/login', data),
  // 获取用户信息
  getUserInfo: () => api.get('/user/info'),
  // 获取用户列表
  getUserList: (params) => api.get('/users', { params }),
  // 添加用户
  addUser: (data) => api.post('/users', data),
  // 更新用户
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  // 删除用户
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// 审核相关API
export const reviewApi = {
  // 获取审核列表
  getReviewList: (params) => api.get('/reviews', { params }),
  // 获取审核详情
  getReviewDetail: (id) => api.get(`/reviews/${id}`),
  // 审核通过
  approveReview: (id, data) => api.post(`/reviews/${id}/approve`, data),
  // 审核拒绝
  rejectReview: (id, data) => api.post(`/reviews/${id}/reject`, data),
};

// 统计相关API
export const statsApi = {
  // 获取仪表盘数据
  getDashboardStats: () => api.get('/stats/dashboard'),
  // 获取审核统计
  getReviewStats: (params) => api.get('/stats/reviews', { params }),
};

export default api;