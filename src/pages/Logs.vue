<template>
  <div>
    <div class="filters">
      <el-input v-model="filters.phone" placeholder="Номер" style="width: 220px" />
      <el-select v-model="filters.result" clearable placeholder="Результат" style="width: 160px">
        <el-option label="success" value="success" />
        <el-option label="denied" value="denied" />
        <el-option label="pending" value="pending" />
      </el-select>
      <el-input-number v-model="filters.clientId" :min="1" placeholder="Client ID" />
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="-"
        start-placeholder="От"
        end-placeholder="До"
      />
      <el-button type="primary" @click="load">Применить</el-button>
    </div>
    <el-table :data="rows" v-loading="loading" stripe>
      <el-table-column prop="createdAt" label="Дата" width="180" />
      <el-table-column prop="clientId" label="Клиент" width="100" />
      <el-table-column prop="phone" label="Номер" />
      <el-table-column prop="action" label="Действие" width="120" />
      <el-table-column prop="result" label="Результат" width="120" />
      <el-table-column prop="reason" label="Причина" />
      <el-table-column prop="requestId" label="Request ID" />
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
import { onMounted, reactive, ref } from 'vue';
import { logsApi } from '../api/logs';

const rows = ref<any[]>([]);
const loading = ref(false);
const page = ref(1);
const limit = ref(20);
const total = ref(0);
const dateRange = ref<[Date, Date] | null>(null);
const filters = reactive({
  clientId: undefined as number | undefined,
  phone: '',
  result: '' as '' | 'success' | 'denied' | 'pending',
});

async function load() {
  loading.value = true;
  try {
    const data = await logsApi.list({
      page: page.value,
      limit: limit.value,
      clientId: filters.clientId,
      phone: filters.phone || undefined,
      result: filters.result || undefined,
      fromDate: dateRange.value?.[0]?.toISOString(),
      toDate: dateRange.value?.[1]?.toISOString(),
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

onMounted(load);
</script>
