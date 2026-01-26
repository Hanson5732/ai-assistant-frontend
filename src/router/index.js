import { createRouter, createWebHistory } from 'vue-router';
import PaperSummary from '@/views/PaperSummary/index.vue';
import Layout from '@/views/Layout/index.vue';
import FileUpload from '@/views/FileUpload/index.vue';

const routes = [
  {
    path: '/', 
    redirect: '/chat'
  },
  {
    path: '/chat', component: Layout,
    children: [
        { path: '', component: FileUpload },
        { path: ':sessionId', component: PaperSummary }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;