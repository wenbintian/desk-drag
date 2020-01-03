import Vue from 'vue'
import Router from 'vue-router'
import DeskDrag from '@/components/DeskDrag'

Vue.use(Router);

export default new Router({
  routes: [
    { path: '/desk-drag', component: DeskDrag },
  ]
})
