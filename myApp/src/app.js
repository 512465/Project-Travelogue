import { createApp } from 'vue'
import pinia from './stores'
import { createUI } from 'taro-ui-vue3'

import './app.scss'
// 引用全部组件样式
import 'taro-ui-vue3/dist/style/index.scss'

const App = createApp({
  onShow(options) {
  },
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})

App.use(pinia)

const tuv3 = createUI()
App.use(tuv3)



export default App
