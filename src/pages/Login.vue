<template>
  <div class="login-page">
    <el-card class="login-card">
      <template #header>Вход в админ-панель</template>
      <el-form :model="form" @submit.prevent="submit">
        <el-form-item label="Email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="Пароль">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-button type="primary" :loading="loading" @click="submit">Войти</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { adminLogin } from '../api/auth';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const form = reactive({
  email: '',
  password: '',
});

async function submit() {
  loading.value = true;
  try {
    const response = await adminLogin(form);
    authStore.setToken(response.access_token);
    await router.push('/clients');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-card {
  width: 420px;
}
</style>
