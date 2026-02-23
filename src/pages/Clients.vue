<template>
  <div>
    <div class="toolbar">
      <el-input v-model="search" placeholder="Поиск по названию" style="width: 260px" />
      <el-button type="primary" @click="goCreate">Добавить клиента</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="Название" />
      <el-table-column prop="domain" label="Домен" />
      <el-table-column label="Статус" width="120">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'">
            {{ row.isActive ? 'Активен' : 'Неактивен' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="Создан" width="180" />
      <el-table-column label="Действия" width="460">
        <template #default="{ row }">
          <el-button size="small" @click="goEdit(row.id)">Редактировать</el-button>
          <el-button size="small" @click="goWhitelist(row.id)">Whitelist</el-button>
          <el-button size="small" @click="goClientBlacklist(row.id)">Blacklist</el-button>
          <el-button size="small" @click="regenerate(row.id)">Новый ключ</el-button>
          <el-button size="small" type="danger" @click="remove(row.id)">Удалить</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pager"
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="limit"
      @current-change="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElNotification } from 'element-plus';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { clientsApi } from '../api/clients';

const router = useRouter();
const loading = ref(false);
const rows = ref<any[]>([]);
const page = ref(1);
const limit = ref(20);
const total = ref(0);
const search = ref('');

async function load() {
  loading.value = true;
  try {
    const data = await clientsApi.list({
      page: page.value,
      limit: limit.value,
      search: search.value || undefined,
    });
    rows.value = data.items || [];
    total.value = data.total || 0;
  } finally {
    loading.value = false;
  }
}

function onPageChange(nextPage: number) {
  page.value = nextPage;
  load();
}

function goCreate() {
  router.push('/clients/new');
}
function goEdit(id: number) {
  router.push(`/clients/${id}/edit`);
}
function goWhitelist(id: number) {
  router.push(`/clients/${id}/whitelist`);
}
function goClientBlacklist(id: number) {
  router.push(`/clients/${id}/blacklist`);
}

async function remove(id: number) {
  await ElMessageBox.confirm('Удалить клиента?', 'Подтверждение', { type: 'warning' });
  await clientsApi.remove(id);
  await load();
}

async function regenerate(id: number) {
  await ElMessageBox.confirm('Сгенерировать новый API-ключ?', 'Подтверждение', {
    type: 'warning',
  });
  const data = await clientsApi.regenerateKey(id);
  ElNotification({
    title: 'Новый API-ключ',
    type: 'success',
    message: data.apiKey,
    duration: 0,
  });
}

watch(search, () => {
  page.value = 1;
  load();
});

onMounted(load);
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  justify-content: space-between;
}
.pager {
  margin-top: 16px;
  justify-content: center;
}
</style>
