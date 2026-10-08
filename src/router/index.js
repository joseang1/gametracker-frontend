import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { guard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/:pathMatch(.*)*', // catch-all: any unknown URL
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  // Start each new page at the top
  scrollBehavior: (to, from, savedPosition) => savedPosition ?? { top: 0 },
})

router.beforeEach(guard)

export default router
