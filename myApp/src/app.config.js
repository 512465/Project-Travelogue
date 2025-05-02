export default {
  pages: [
    'pages/index/index',
    "pages/my-itineraries/index", // 我的游记
    "pages/publish-itinerary/index", // 游记发布
    "pages/itinerary-details/index", // 游记详情
    "pages/user-authentication/index" // 用户登录/注册
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#666',
    selectedColor: '#007AFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'pages/itinerary-details/index',
        text: '游记详情',
      },
      {
        pagePath: 'pages/user-authentication/index',
        text: '用户登录/注册',
      },
      {
        pagePath: 'pages/publish-itinerary/index',
        text: '发布游记',
      },
      {
        pagePath:'pages/my-itineraries/index',
        text:'我的',
     },
    ]
  }
}
