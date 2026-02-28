import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import LoginPage from '../pages/Login.vue';
import ClientsPage from '../pages/Clients.vue';
import ClientFormPage from '../pages/ClientForm.vue';
import BlacklistPage from '../pages/Blacklist.vue';
import WhitelistPage from '../pages/Whitelist.vue';
import ClientBlacklistPage from '../pages/ClientBlacklist.vue';
import LogsPage from '../pages/Logs.vue';
import ProvidersPage from '../pages/Providers.vue';
import IntegrationPage from '../pages/Integration.vue';

const routes: RouteRecordRaw[] = [
  { path: '/login', component: LoginPage, meta: { guestOnly: true } },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', redirect: '/clients' },
      { path: 'clients', component: ClientsPage },
      { path: 'integration', component: IntegrationPage },
      { path: 'clients/new', component: ClientFormPage },
      { path: 'clients/:id/edit', component: ClientFormPage },
      { path: 'clients/:clientId/whitelist', component: WhitelistPage },
      { path: 'clients/:clientId/blacklist', component: ClientBlacklistPage },
      { path: 'blacklist', component: BlacklistPage },
      { path: 'logs', component: LogsPage },
      { path: 'providers', component: ProvidersPage },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem('admin_token');
  if (!token && to.path !== '/login') return '/login';
  if (token && to.path === '/login') return '/clients';
  return true;
});
