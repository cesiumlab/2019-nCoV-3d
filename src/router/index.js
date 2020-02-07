import Vue from 'vue'
import Router from 'vue-router'
import Flatmap from '@/pages/Flatmap' 
import Heatmap from '@/pages/Heatmap' 
import Zhibo from '@/pages/Zhibo' 
import Beammap from "@/pages/Beammap"
import Zhanyi from '@/pages/Zhanyi' 
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: 'flatmap/:area',
      name: 'flatmap',
      component: Flatmap
    },
    {
      path: 'heatmap',
      name: 'heatmap',
      component: Heatmap
    },
    {
      path: 'zhibo',
      name: 'zhibo',
      component: Zhibo
    },
    {
      path: 'beammap/:area',
      name: 'beammap',
      component: Beammap
    },
    {
      path: 'zhanyi',
      name: 'zhanyi',
      component: Zhanyi
    }
  ]
})
