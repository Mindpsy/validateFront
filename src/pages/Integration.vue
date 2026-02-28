<template>
  <div class="integration-page">
    <h2>Подключение к сайту клиента</h2>
    <p class="intro">
      Сгенерируйте код для вставки на сайт клиента. Скрипт покажет форму ввода телефона и кода подтверждения,
      вызовет API верификации и по успеху выполнит callback <code>window.__VALIDATE_ON_SUCCESS__</code> (если задан).
    </p>

    <el-form label-width="140px" class="form">
      <el-form-item label="Клиент">
        <el-select
          v-model="clientId"
          placeholder="Выберите клиента"
          filterable
          style="width: 320px"
          @change="onClientChange"
        >
          <el-option
            v-for="c in clients"
            :key="c.id"
            :label="`${c.name} (ID ${c.id})`"
            :value="c.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="URL API (база)">
        <el-input v-model="apiBase" placeholder="https://ваш-бэкенд/api" style="width: 400px" />
        <div class="hint">Базовый URL вашего API без слэша в конце (например https://mindpsy-validateback-733f.twc1.net/api)</div>
      </el-form-item>
      <el-form-item label="API ключ">
        <el-input
          v-model="apiKey"
          type="password"
          placeholder="Вставьте ключ или нажмите «Регенерировать»"
          style="width: 400px"
          show-password
        />
        <el-button
          type="warning"
          plain
          class="regen-btn"
          :disabled="!clientId"
          @click="regenerateKey"
        >
          Регенерировать ключ
        </el-button>
        <div class="hint">
          Ключ показывается только при создании клиента и при регенерации. После регенерации старый ключ перестаёт работать.
        </div>
      </el-form-item>
    </el-form>

    <template v-if="clientId && apiBase">
      <h3>Код для вставки на сайт</h3>
      <p>1) Добавьте контейнер, в который будет отрисована форма:</p>
      <el-input
        :model-value="containerSnippet"
        type="textarea"
        readonly
        :rows="2"
        class="snippet"
      />
      <p>2) Подключите скрипт (подставьте свой API ключ в <code>data-api-key</code>):</p>
      <el-input
        :model-value="scriptSnippet"
        type="textarea"
        readonly
        :rows="4"
        class="snippet"
      />
      <el-button type="primary" @click="copyAll">Копировать оба блока</el-button>

      <h3>Опционально</h3>
      <ul class="instructions">
        <li><strong>Другой контейнер:</strong> задайте <code>data-container-id="my-id"</code> в теге script и добавьте на страницу <code>&lt;div id="my-id"&gt;&lt;/div&gt;</code>.</li>
        <li><strong>Callback после успеха:</strong> перед загрузкой скрипта задайте <code>window.__VALIDATE_ON_SUCCESS__ = function() { ... }</code> — он будет вызван после успешного подтверждения номера.</li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, ref, watch } from 'vue';
import { getApiBase } from '../api/http';
import { clientsApi } from '../api/clients';

const clients = ref<{ id: number; name: string }[]>([]);
const clientId = ref<number | null>(null);
const apiKey = ref('');
const apiBase = ref(getApiBase());

onMounted(async () => {
  try {
    const data = await clientsApi.list({ page: 1, limit: 500 });
    clients.value = data.items || [];
  } catch {
    ElMessage.error('Не удалось загрузить список клиентов');
  }
});

watch(apiBase, (v) => {
  if (!v) apiBase.value = getApiBase();
});

function onClientChange() {
  apiKey.value = '';
}

const scriptUrl = computed(() => {
  const base = (apiBase.value || '').trim().replace(/\/+$/, '');
  return base ? `${base}/embed/validate.js` : '';
});

const containerSnippet = computed(() => {
  return '<div id="validate-phone-widget"></div>';
});

const scriptSnippet = computed(() => {
  if (!scriptUrl.value || !clientId.value) return '';
  const key = apiKey.value || 'ВСТАВЬТЕ_ВАШ_API_КЛЮЧ';
  return `<script src="${scriptUrl.value}" data-client-id="${clientId.value}" data-api-key="${key}" data-api-base="${(apiBase.value || '').trim().replace(/\/+$/, '')}"><\/script>`;
});

async function regenerateKey() {
  if (!clientId.value) return;
  try {
    await ElMessageBox.confirm(
      'Старый API ключ перестанет работать. Продолжить?',
      'Регенерация ключа',
      { confirmButtonText: 'Да', cancelButtonText: 'Отмена', type: 'warning' }
    );
  } catch {
    return;
  }
  try {
    const data = await clientsApi.regenerateKey(clientId.value);
    apiKey.value = data.apiKey;
    ElMessage.success('Новый ключ сгенерирован. Подставьте его в код выше.');
  } catch {
    ElMessage.error('Не удалось регенерировать ключ');
  }
}

function copyAll() {
  const script = scriptSnippet.value.replace(/\\\//g, '/');
  const text = containerSnippet.value + '\n\n' + script;
  navigator.clipboard.writeText(text).then(
    () => ElMessage.success('Скопировано в буфер обмена'),
    () => ElMessage.error('Не удалось скопировать')
  );
}
</script>

<style scoped>
.integration-page {
  max-width: 720px;
}
.intro {
  color: #666;
  margin-bottom: 1.5rem;
}
.intro code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}
.form {
  margin-bottom: 2rem;
}
.regen-btn {
  margin-left: 8px;
}
.hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}
.snippet {
  font-family: ui-monospace, monospace;
  margin-bottom: 1rem;
}
.instructions {
  color: #555;
  line-height: 1.6;
}
.instructions code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}
h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
</style>
