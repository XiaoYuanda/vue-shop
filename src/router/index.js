import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue' // 导入登录组件
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Rights from '../components/rights/Rights.vue'
import Roles from '../components/roles/Roles.vue'
import Users from '../components/user/Users.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params'
import GoodsList from '../components/goods/List.vue'
import AddGoods from '../components/goods/AddGoods.vue'

Vue.use(VueRouter)

// 路由规则数组
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/users', component: Users },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: AddGoods }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
