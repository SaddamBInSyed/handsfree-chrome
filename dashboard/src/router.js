import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    { path: '/', component: () => import('@/views/Home') },
    { path: '/calibrate', component: () => import('@/views/Calibrate') }
  ]
})
