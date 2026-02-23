<template>
  <div>
    <div class="toolbar">
      <el-input v-model="phoneFilter" placeholder="Фильтр по номеру" style="width: 280px" />
      <el-button type="primary" @click="dialog = true">Добавить</el-button>
    </div>
    <el-table :data="rows" v-loading="loading">
      <el-table-column prop="phone" label="Номер" />
      <el-table-column prop="reason" label="Причина" />
      <el-table-column prop="comment" label="Комментарий" />
      <el-table-column prop="createdAt" label="Дата" />
      <el-table-column label="Действие" width="120">
        <template #default="{ row }">
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

    <el-dialog v-model="dialog" title="Добавить в blacklist" width="460px">
      <el-form :model="form">
        <el-form-item label="Номер"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="Причина"><el-input v-model="form.reason" /></el-form-item>
        <el-form-item label="Комментарий"><el-input v-model="form.comment" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">Отмена</el-button>
        <el-button type="primary" @click="add">Сохранить</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { blacklistApi } from '../api/blacklist';

const rows = ref<any[]>([]);
const page = ref(1);
const limit = ref(20);
const total = ref(0);
const loading = ref(false);
const phoneFilter = ref('');
const dialog = ref(false);
const form = reactive({
  phone: '',
  reason: '',
  comment: '',
});

async function load() {
  loading.value = true;
  try {
    const data = await blacklistApi.list({
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
  if (!parsed?.isValid()) return;
  await blacklistApi.create({
    phone: parsed.number,
    reason: form.reason,
    comment: form.comment || undefined,
  });
  dialog.value = false;
  form.phone = '';
  form.reason = '';
  form.comment = '';
  await load();
}

async function remove(id: number) {
  await blacklistApi.remove(id);
  await load();
}

watch(phoneFilter, () => {
  page.value = 1;
  load();
});
onMounted(load);
</script>
