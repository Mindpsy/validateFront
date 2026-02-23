<template>
  <el-container class="layout-root">
    <el-aside width="220px" class="sidebar">
      <div class="logo">Validate Admin</div>
      <el-menu :default-active="route.path" router>
        <el-menu-item index="/clients">Клиенты</el-menu-item>
        <el-menu-item index="/blacklist">Глобальный чёрный список</el-menu-item>
        <el-menu-item index="/logs">Логи</el-menu-item>
        <el-menu-item index="/providers">Провайдеры</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span>Админ-панель</span>
        <el-button type="danger" plain @click="logout">Выход</el-button>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

function logout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.layout-root {
  min-height: 100vh;
}
.sidebar {
  border-right: 1px solid #eee;
}
.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.header {
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
