<template>
  <el-card>
    <template #header>{{ isEdit ? 'Редактировать клиента' : 'Создать клиента' }}</template>

    <el-form :model="form" label-width="180px">
      <el-tabs>
        <el-tab-pane label="Основное">
          <el-form-item label="Название">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="Домен">
            <el-input v-model="form.domain" />
          </el-form-item>
          <el-form-item label="Активен">
            <el-switch v-model="form.isActive" />
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="Настройки">
          <el-form-item label="Разрешённые регионы">
            <el-select v-model="form.allowedRegions" multiple filterable style="width: 100%">
              <el-option v-for="c in countries" :key="c.code" :label="c.name" :value="c.code" />
            </el-select>
          </el-form-item>
          <el-form-item label="Метод подтверждения">
            <el-radio-group v-model="form.verificationMethod">
              <el-radio label="sms">SMS</el-radio>
              <el-radio label="flash">Flash Call</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Кастомный SMS текст">
            <el-input
              v-model="form.customSmsText"
              placeholder="Ваш код: {code}"
            />
          </el-form-item>
          <el-form-item label="Provider ID">
            <el-input-number v-model="form.providerId" :min="1" />
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <el-button type="primary" :loading="loading" @click="submit">Сохранить</el-button>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElNotification } from 'element-plus';
import { clientsApi } from '../api/clients';
import { countries } from '../utils/countries';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const isEdit = computed(() => Boolean(route.params.id));

const form = reactive({
  name: '',
  domain: '',
  isActive: true,
  allowedRegions: [] as string[],
  verificationMethod: 'sms',
  customSmsText: '',
  providerId: undefined as number | undefined,
});

async function load() {
  if (!isEdit.value) return;
  const data = await clientsApi.get(Number(route.params.id));
  form.name = data.name;
  form.domain = data.domain || '';
  form.isActive = data.isActive;
  form.allowedRegions = data.settings?.allowedRegions || [];
  form.verificationMethod = data.settings?.verificationMethod || 'sms';
  form.customSmsText = data.settings?.customSmsText || '';
  form.providerId = data.settings?.providerId || undefined;
}

async function submit() {
  loading.value = true;
  try {
    if (isEdit.value) {
      await clientsApi.update(Number(route.params.id), form);
      ElNotification({ title: 'Успех', message: 'Клиент обновлён', type: 'success' });
    } else {
      const result = await clientsApi.create(form);
      ElNotification({
        title: 'Клиент создан',
        message: `API-ключ: ${result.apiKey}`,
        type: 'success',
        duration: 0,
      });
    }
    await router.push('/clients');
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
