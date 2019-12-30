import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [{ path: '/calibrate', component: () => import('@/views/Calibrate') }]
})
