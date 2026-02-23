<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="openCreate">Добавить провайдера</el-button>
    </div>
    <el-table :data="rows" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="name" label="Название" />
      <el-table-column prop="type" label="Тип" width="120" />
      <el-table-column label="Активен" width="120">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'">
            {{ row.isActive ? 'Да' : 'Нет' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="240">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">Изменить</el-button>
          <el-button size="small" type="danger" @click="remove(row.id)">Удалить</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog" :title="editingId ? 'Редактировать' : 'Создать'" width="560px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="Название"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="Тип">
          <el-select v-model="form.type">
            <el-option label="SMS" value="sms" />
            <el-option label="Flash" value="flash" />
          </el-select>
        </el-form-item>
        <el-form-item label="Активен"><el-switch v-model="form.isActive" /></el-form-item>
        <el-form-item label="Config JSON">
          <el-input v-model="form.configJson" type="textarea" :rows="6" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">Отмена</el-button>
        <el-button type="primary" @click="save">Сохранить</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { providersApi } from '../api/providers';

const rows = ref<any[]>([]);
const loading = ref(false);
const dialog = ref(false);
const editingId = ref<number | null>(null);
const form = reactive({
  name: '',
  type: 'sms' as 'sms' | 'flash',
  isActive: true,
  configJson: '{}',
});

async function load() {
  loading.value = true;
  try {
    const data = await providersApi.list({});
    rows.value = data.items || [];
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  form.name = '';
  form.type = 'sms';
  form.isActive = true;
  form.configJson = '{}';
  dialog.value = true;
}

function openEdit(provider: any) {
  editingId.value = provider.id;
  form.name = provider.name;
  form.type = provider.type;
  form.isActive = provider.isActive;
  form.configJson = JSON.stringify(provider.config || {}, null, 2);
  dialog.value = true;
}

async function save() {
  const payload = {
    name: form.name,
    type: form.type,
    isActive: form.isActive,
    config: JSON.parse(form.configJson || '{}'),
  };
  if (editingId.value) {
    await providersApi.update(editingId.value, payload);
  } else {
    await providersApi.create(payload);
  }
  dialog.value = false;
  await load();
}

async function remove(id: number) {
  await providersApi.remove(id);
  await load();
}

onMounted(load);
</script>
