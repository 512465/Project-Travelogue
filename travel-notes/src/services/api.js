import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://175.24.138.67:8586', // 服务器地址
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
      // 检查当前路径，如果不是在登录页面才重定向
      if (!window.location.pathname.includes('/login')) {
        console.log('401错误，重定向到登录页');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
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
  // 获取管理员详细信息
  getAdminInfo: (adminId) => api.get(`/api/admin/${adminId}`),
  // 获取管理员列表
  getAdminList: (params) => api.get('/api/admin', { params }),
  // 更新管理员
  updateAdmin: (adminId, data) => api.patch(`/api/admin/${adminId}`, data),
  // 删除管理员
  deleteAdmin: (adminId) => api.delete(`/api/admin/${adminId}`),
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
  getReviewList: (params) => api.get('/api/travelogue/list', { params }),
  // 获取审核详情
  getReviewDetail: (id) => api.get(`/api/travelogue/${id}`),
  // 更新游记状态（通过/拒绝/删除）
  updateTravelogueStatus: (id, data) => api.patch(`/api/travelogue/admin/${id}`, data),
};

// 统计相关API
export const statsApi = {
  // 获取仪表盘数据
  getDashboardStats: () => api.get('/stats/dashboard'),
  // 获取审核统计
  getReviewStats: (params) => api.get('/stats/reviews', { params }),
};

// 游记相关API
export const travelogueApi = {
  // 获取游记列表
  getTravelogueList: (params) => api.get('/api/travelogue/list', { params }),
  // 获取游记详情
  getTravelogueDetail: (id) => api.get(`/api/travelogue/${id}`),
  // 更新游记状态（通过/拒绝/删除）
  updateTravelogueStatus: (id, data) => api.patch(`/api/travelogue/admin/${id}`, data),
  // 删除游记（管理员专用）
  deleteTravelogue: (id) => api.delete(`/api/travelogue/admin/${id}`),
};

export default api;