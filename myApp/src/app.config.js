export default {
  pages: [
    'pages/index/index',
    "pages/my-itineraries/index", // 我的游记
    "pages/publish-itinerary/index", // 游记发布
    "pages/travelDetail/index", // 游记详情
    "pages/login/index", // 登录
    "pages/travel-notes/index", // 我的游记
    "pages/edit/index",// 编辑
    "pages/favorites/index" // 收藏
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
        iconPath: 'assets/home.png',
        selectedIconPath: 'assets/home_active.png',
        text: '首页',
      },
      {
        pagePath: 'pages/publish-itinerary/index',
        iconPath: 'assets/add.png',
        selectedIconPath: 'assets/add_active.png',
        text: '发布游记',
      },
      {
        pagePath: 'pages/my-itineraries/index',
        iconPath: 'assets/my.png',
        selectedIconPath: 'assets/my_active.png',
        text: '我的',
      },
    ]
  }
}
