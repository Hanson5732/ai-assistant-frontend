import { createRouter, createWebHistory } from 'vue-router';
import PaperSummary from '@/views/PaperSummary/index.vue';
import Layout from '@/views/Layout/index.vue';
import FileUpload from '@/views/FileUpload/index.vue';
import Bibliography from '@/views/Bibliography/index.vue';
import BibliographyDetail from '@/views/BibliographyDetail/index.vue';
import Folder from '@/views/Folder/index.vue';
import FolderDetail from '@/views/FolderDetail/index.vue';

const routes = [
  {
    path: '/', 
    redirect: '/chat'
  },
  {
    path: '/chat', component: Layout,
    children: [
        { path: '', name: 'ChatHome', component: FileUpload },
        { path: ':sessionId', name: 'PaperDetail', component: PaperSummary }
    ]
  },
  {
    path: '/bibliography', component: Layout,
    children: [
        { path: '', name: 'BibliographyHome', component: Bibliography },
        { path: ':id', name: 'BibliographyDetail', component: BibliographyDetail }
    ]
  },
  {
    path: '/folder', component: Layout,
    children: [
        { path: '', name: 'FolderHome', component: Folder },
        { path: ':id', name: 'FolderDetail', component: FolderDetail }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;