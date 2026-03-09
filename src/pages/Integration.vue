<template>
  <div class="integration-page">
    <h2>Интеграция на сайт клиента</h2>
    <p class="intro">
      Выберите клиента и провайдера, затем нажмите «Сгенерировать» — вы получите готовый скрипт
      и инструкцию для подключения валидации номера телефона на сайте.
    </p>

    <el-form label-width="160px" class="form">
      <el-form-item label="Клиент">
        <el-select
          v-model="clientId"
          placeholder="Выберите клиента"
          filterable
          style="width: 360px"
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

      <el-form-item label="Провайдер SMS">
        <el-select
          v-model="providerId"
          placeholder="Выберите провайдера"
          filterable
          style="width: 360px"
        >
          <el-option
            v-for="p in providers"
            :key="p.id"
            :label="`${p.name} (${p.type})`"
            :value="p.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="URL API (база)">
        <el-input v-model="apiBase" placeholder="https://ваш-бэкенд/api" style="width: 400px" />
        <div class="hint">Базовый URL API без слэша в конце</div>
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
          Ключ отображается только при создании клиента и регенерации.
        </div>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          size="large"
          :disabled="!canGenerate"
          @click="generate"
        >
          Сгенерировать
        </el-button>
      </el-form-item>
    </el-form>

    <template v-if="generated">
      <el-divider />

      <h3>Скрипт для вставки</h3>
      <p class="section-desc">Добавьте этот тег <code>&lt;script&gt;</code> на страницу клиента:</p>
      <el-input
        :model-value="scriptSnippet"
        type="textarea"
        readonly
        :rows="3"
        class="snippet"
      />
      <el-button type="primary" @click="copySnippet(scriptSnippet)">Копировать скрипт</el-button>

      <h3>HTML-разметка на стороне клиента</h3>
      <p class="section-desc">Добавьте на страницу два блока — форму валидации и целевой контент:</p>
      <el-input
        :model-value="htmlSnippet"
        type="textarea"
        readonly
        :rows="8"
        class="snippet"
      />
      <el-button type="primary" @click="copySnippet(htmlSnippet)">Копировать разметку</el-button>

      <h3>Инструкция по интеграции</h3>
      <div class="instructions">
        <h4>Шаг 1. Подключите скрипт</h4>
        <p>Вставьте тег <code>&lt;script&gt;</code> (блок выше) перед закрывающим <code>&lt;/body&gt;</code>.</p>

        <h4>Шаг 2. Разметьте блоки на странице</h4>
        <p>Создайте два блока с фиксированными <code>id</code>:</p>
        <ul>
          <li>
            <code>id="validate-form"</code> — контейнер, куда будет отрисована форма валидации.
            Скрипт автоматически отрисует форму в этом блоке.
          </li>
          <li>
            <code>id="validate-target"</code> — блок с целевым действием (например, форма заказа).
            Он будет автоматически скрыт при загрузке и показан после успешной верификации.
          </li>
        </ul>

        <h4>Шаг 3. Доступные функции</h4>
        <p>После подключения скрипта на странице становится доступен глобальный объект <code>window.ValidateWidget</code> с методами:</p>

        <div class="fn-card">
          <div class="fn-name">ValidateWidget.sendCode(phone)</div>
          <div class="fn-desc">
            Отправляет SMS-код на указанный номер телефона.
            Возвращает <code>Promise</code> с объектом <code>{ success, requestId?, message? }</code>.
          </div>
          <div class="fn-example">
            <code>ValidateWidget.sendCode('+79991234567').then(res => console.log(res))</code>
          </div>
        </div>

        <div class="fn-card">
          <div class="fn-name">ValidateWidget.confirmCode(code)</div>
          <div class="fn-desc">
            Проверяет введённый пользователем код подтверждения.
            Возвращает <code>Promise</code> с объектом <code>{ success, message? }</code>.
            При успехе автоматически показывает целевой блок и скрывает форму.
          </div>
          <div class="fn-example">
            <code>ValidateWidget.confirmCode('123456').then(res => console.log(res))</code>
          </div>
        </div>

        <div class="fn-card">
          <div class="fn-name">ValidateWidget.renderForm(containerId?)</div>
          <div class="fn-desc">
            Отрисовывает готовую форму валидации (ввод телефона → ввод кода → результат).
            По умолчанию рендерит в блок с <code>id="validate-form"</code>.
            Можно передать другой <code>containerId</code>.
          </div>
          <div class="fn-example">
            <code>ValidateWidget.renderForm()  // в #validate-form</code><br>
            <code>ValidateWidget.renderForm('my-container')  // в #my-container</code>
          </div>
        </div>

        <div class="fn-card">
          <div class="fn-name">ValidateWidget.showTarget()</div>
          <div class="fn-desc">
            Показывает ранее скрытый блок с <code>id="validate-target"</code>.
            Вызывается автоматически после успешного подтверждения, но можно вызвать вручную.
          </div>
          <div class="fn-example">
            <code>ValidateWidget.showTarget()</code>
          </div>
        </div>

        <div class="fn-card">
          <div class="fn-name">ValidateWidget.toggleForm(visible)</div>
          <div class="fn-desc">
            Показывает или скрывает блок с <code>id="validate-form"</code>.
            Параметр <code>visible</code> — булево значение: <code>true</code> — показать, <code>false</code> — скрыть.
          </div>
          <div class="fn-example">
            <code>ValidateWidget.toggleForm(true)  // показать</code><br>
            <code>ValidateWidget.toggleForm(false) // скрыть</code>
          </div>
        </div>

        <h4>Шаг 4. Callback после успеха (опционально)</h4>
        <p>
          Перед подключением скрипта можно определить функцию
          <code>window.__VALIDATE_ON_SUCCESS__</code> — она будет вызвана после успешного подтверждения номера:
        </p>
        <el-input
          :model-value="callbackSnippet"
          type="textarea"
          readonly
          :rows="3"
          class="snippet"
        />

        <h4>Идентификаторы блоков (сводка)</h4>
        <table class="id-table">
          <thead>
            <tr><th>ID</th><th>Назначение</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>validate-form</code></td>
              <td>Контейнер формы валидации. Используется функциями <code>renderForm()</code> и <code>toggleForm()</code>.</td>
            </tr>
            <tr>
              <td><code>validate-target</code></td>
              <td>Блок с целевым действием. Скрывается при загрузке, показывается после подтверждения функцией <code>showTarget()</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, ref } from 'vue';
import { getApiBase } from '../api/http';
import { clientsApi } from '../api/clients';
import { providersApi } from '../api/providers';

interface ClientItem { id: number; name: string; settings?: { providerId?: number | null } }
interface ProviderItem { id: number; name: string; type: string }

const clients = ref<ClientItem[]>([]);
const providers = ref<ProviderItem[]>([]);
const clientId = ref<number | null>(null);
const providerId = ref<number | null>(null);
const apiKey = ref('');
const apiBase = ref(getApiBase());
const generated = ref(false);

onMounted(async () => {
  try {
    const [clientData, providerData] = await Promise.all([
      clientsApi.list({ page: 1, limit: 500 }),
      providersApi.list({ page: 1, limit: 500 }),
    ]);
    clients.value = clientData.items || [];
    providers.value = (providerData.items || []).filter((p: ProviderItem & { isActive?: boolean }) => p.isActive !== false);
  } catch {
    ElMessage.error('Не удалось загрузить данные');
  }
});

function onClientChange() {
  apiKey.value = '';
  generated.value = false;
  const client = clients.value.find(c => c.id === clientId.value);
  if (client?.settings?.providerId) {
    providerId.value = client.settings.providerId;
  }
}

const canGenerate = computed(() => clientId.value && providerId.value && apiBase.value && apiKey.value);

const scriptSnippet = computed(() => {
  if (!clientId.value || !apiBase.value) return '';
  const base = apiBase.value.trim().replace(/\/+$/, '');
  const key = apiKey.value || 'ВСТАВЬТЕ_ВАШ_API_КЛЮЧ';
  const url = `${base}/embed/validate.js?clientId=${clientId.value}&apiKey=${encodeURIComponent(key)}&apiBase=${encodeURIComponent(base)}`;
  return `<script src="${url}"><\/script>`;
});

const htmlSnippet = computed(() => {
  return `<!-- Блок формы валидации (будет отрисована автоматически) -->
<div id="validate-form"></div>

<!-- Блок целевого действия (скрыт до подтверждения номера) -->
<div id="validate-target">
  <!-- Ваш контент: форма заказа, кнопка и т.д. -->
</div>`;
});

const callbackSnippet = `<script>
window.__VALIDATE_ON_SUCCESS__ = function() {
  console.log('Номер подтверждён!');
};
<\/script>`;

async function regenerateKey() {
  if (!clientId.value) return;
  try {
    await ElMessageBox.confirm(
      'Старый API ключ перестанет работать. Продолжить?',
      'Регенерация ключа',
      { confirmButtonText: 'Да', cancelButtonText: 'Отмена', type: 'warning' },
    );
  } catch { return; }
  try {
    const data = await clientsApi.regenerateKey(clientId.value);
    apiKey.value = data.apiKey;
    ElMessage.success('Новый ключ сгенерирован');
  } catch {
    ElMessage.error('Не удалось регенерировать ключ');
  }
}

async function generate() {
  if (!clientId.value || !providerId.value) return;
  // Сохраняем выбранного провайдера в настройки клиента
  try {
    await clientsApi.update(clientId.value, {
      settings: { providerId: providerId.value },
    });
  } catch {
    ElMessage.error('Не удалось сохранить провайдера для клиента');
    return;
  }
  generated.value = true;
  ElMessage.success('Скрипт сгенерирован');
}

function copySnippet(text: string) {
  navigator.clipboard.writeText(text.replace(/\\\//g, '/')).then(
    () => ElMessage.success('Скопировано'),
    () => ElMessage.error('Не удалось скопировать'),
  );
}
</script>

<style scoped>
.integration-page {
  max-width: 820px;
}
.intro {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}
.form {
  margin-bottom: 1.5rem;
}
.regen-btn {
  margin-left: 8px;
}
.hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}
.section-desc {
  color: #555;
  margin-bottom: 8px;
}
.snippet {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  margin-bottom: 12px;
}
h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
h4 {
  margin-top: 1.2rem;
  margin-bottom: 0.4rem;
  color: #333;
}

/* instruction cards */
.instructions {
  color: #444;
  line-height: 1.7;
}
.instructions code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}
.instructions ul {
  padding-left: 1.5rem;
}

.fn-card {
  background: #fafbfc;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 10px;
}
.fn-name {
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 14px;
  color: #1a1a1a;
  margin-bottom: 6px;
}
.fn-desc {
  font-size: 13px;
  color: #555;
  margin-bottom: 8px;
}
.fn-example {
  font-size: 12px;
  background: #f0f0f0;
  padding: 8px 12px;
  border-radius: 6px;
}
.fn-example code {
  background: transparent;
  padding: 0;
  font-size: 12px;
}

.id-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 14px;
}
.id-table th,
.id-table td {
  text-align: left;
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
}
.id-table th {
  background: #f5f5f5;
  font-weight: 600;
}
.id-table td code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
