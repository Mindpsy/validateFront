<template>
  <div>
    <div class="toolbar">
      <div class="header-row">
        <h3>Белый список: {{ clientName || `#${clientId}` }}</h3>
        <div class="nav-links">
          <router-link :to="`/clients/${clientId}/blacklist`" class="nav-link">
            Чёрный список клиента
          </router-link>
        </div>
      </div>
      <el-button type="primary" @click="dialog = true">Добавить номер</el-button>
    </div>

    <el-table :data="rows" v-loading="loading">
      <el-table-column prop="phone" label="Номер" />
      <el-table-column prop="comment" label="Комментарий" />
      <el-table-column prop="createdAt" label="Добавлен" />
      <el-table-column label="Действия" width="120">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="remove(row.id)">Удалить</el-button>
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

    <el-dialog v-model="dialog" title="Добавить номер" width="460px">
      <el-form :model="form">
        <el-form-item label="Номер">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="Комментарий">
          <el-input v-model="form.comment" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">Отмена</el-button>
        <el-button type="primary" @click="add">Сохранить</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { whitelistApi } from '../api/whitelist';
import { clientsApi } from '../api/clients';

const route = useRoute();
const clientId = Number(route.params.clientId);

const clientName = ref('');
const rows = ref<any[]>([]);
const loading = ref(false);
const page = ref(1);
const limit = ref(20);
const total = ref(0);
const dialog = ref(false);
const form = reactive({
  phone: '',
  comment: '',
});

async function loadClient() {
  try {
    const client = await clientsApi.get(clientId);
    clientName.value = client.name || '';
  } catch {
    clientName.value = '';
  }
}

async function load() {
  loading.value = true;
  try {
    const data = await whitelistApi.list(clientId, { page: page.value, limit: limit.value });
    rows.value = data.items || [];
    total.value = data.total || 0;
  } finally {
    loading.value = false;
  }
}

function onPageChange(p: number) {
  page.value = p;
  load();
}

async function add() {
  const parsed = parsePhoneNumberFromString(form.phone);
  if (!parsed?.isValid()) return;
  await whitelistApi.create(clientId, { phone: parsed.number, comment: form.comment || undefined });
  dialog.value = false;
  form.phone = '';
  form.comment = '';
  await load();
}

async function remove(id: number) {
  await whitelistApi.remove(clientId, id);
  await load();
}

onMounted(() => {
  loadClient();
  load();
});
</script>

<style scoped>
.header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.nav-links {
  display: flex;
  gap: 12px;
}
.nav-link {
  color: var(--el-color-primary);
  text-decoration: none;
  font-size: 14px;
}
.nav-link:hover {
  text-decoration: underline;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
.pager {
  margin-top: 16px;
  justify-content: center;
}
</style>
