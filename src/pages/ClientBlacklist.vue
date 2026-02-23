<template>
  <div>
    <div class="toolbar">
      <div class="header-row">
        <h3>Чёрный список: {{ clientName || `#${clientId}` }}</h3>
        <div class="nav-links">
          <router-link :to="`/clients/${clientId}/whitelist`" class="nav-link">
            Белый список клиента
          </router-link>
        </div>
      </div>
      <div class="toolbar-actions">
        <el-input
          v-model="phoneFilter"
          placeholder="Фильтр по номеру"
          style="width: 240px"
        />
        <el-button type="primary" @click="dialog = true">Добавить номер</el-button>
      </div>
    </div>

    <el-table :data="rows" v-loading="loading" stripe>
      <el-table-column prop="phone" label="Номер" />
      <el-table-column prop="reason" label="Причина" width="180" />
      <el-table-column prop="comment" label="Комментарий" />
      <el-table-column prop="createdAt" label="Дата добавления" width="180" />
      <el-table-column label="Действия" width="140">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="confirmRemove(row)">Удалить</el-button>
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

    <el-dialog v-model="dialog" title="Добавить в blacklist клиента" width="500px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="Номер">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="Причина">
          <el-input v-model="form.reason" placeholder="Например: fraud / spam / custom" />
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
import { ElMessageBox } from 'element-plus';
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { clientBlacklistApi } from '../api/client-blacklist';
import { clientsApi } from '../api/clients';

const route = useRoute();
const clientId = Number(route.params.clientId);

const clientName = ref('');
const rows = ref<any[]>([]);
const loading = ref(false);
const page = ref(1);
const limit = ref(20);
const total = ref(0);
const phoneFilter = ref('');
const dialog = ref(false);
const form = reactive({
  phone: '',
  reason: '',
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
    const data = await clientBlacklistApi.list(clientId, {
      page: page.value,
      limit: limit.value,
      phone: phoneFilter.value || undefined,
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

async function add() {
  const parsed = parsePhoneNumberFromString(form.phone);
  if (!parsed?.isValid() || !form.reason.trim()) return;
  await clientBlacklistApi.create(clientId, {
    phone: parsed.number,
    reason: form.reason.trim(),
    comment: form.comment || undefined,
  });
  dialog.value = false;
  form.phone = '';
  form.reason = '';
  form.comment = '';
  await load();
}

async function remove(id: number) {
  await clientBlacklistApi.remove(clientId, id);
  await load();
}

async function confirmRemove(row: { id: number; phone: string }) {
  await ElMessageBox.confirm(
    `Удалить номер ${row.phone} из чёрного списка клиента?`,
    'Подтверждение удаления',
    { type: 'warning' },
  );
  await remove(row.id);
}

watch(phoneFilter, () => {
  page.value = 1;
  load();
});

onMounted(() => {
  loadClient();
  load();
});
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
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
.toolbar-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.pager {
  margin-top: 16px;
  justify-content: center;
}
</style>
