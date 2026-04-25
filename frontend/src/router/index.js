import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore';
// Views
import Dashboard from '@/views/Dashboard.vue'
import Login from '@/views/auth/Login.vue'
import Quotations from '@/views/quotations/Quotations.vue'
import AddQuotation from '@/views/quotations/AddQuotation.vue'
import Certificates from '@/views/certificates/Certificates.vue'
import Referrals from '@/views/referrals/Referrals.vue'
import Profile from '@/views/user-profile/Profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },  
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/quotations',
      name: 'Quotations',
      component: Quotations,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/quotations/new',
      name: 'New Quote',
      component: AddQuotation,
    },
    {
      path: '/certificates',
      name: 'Certificates',
      component: Certificates,
      meta: {
        requiresAuth: true,
      },
    },
   
    {
      path: '/referrals',
      name: 'Referrals',
      component: Referrals,
      meta: {
        requiresAuth: true,
      },
    },
   
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      requiresAuth: true,
    }
  }
  ],
})

router.beforeEach((to) => {
  const userStore = useUserStore();
  const isAuthenticated = userStore.isAuthenticated();
  const requiresAuth = to.meta.requiresAuth !== false;
  if (requiresAuth && !isAuthenticated) return { name: 'login' };
  if (to.name === 'login' && isAuthenticated) return { name: 'dashboard' };
});

export default router
