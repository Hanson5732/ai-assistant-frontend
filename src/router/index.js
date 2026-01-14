import { createRouter, createWebHistory } from 'vue-router';
import PaperSummary from '@/views/PaperSummary/index.vue';
import Layout from '@/views/Layout/index.vue';

const routes = [
  {
    path: '/', component: Layout,
    children: [
        { path: '', component: PaperSummary },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;