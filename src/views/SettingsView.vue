<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header-text">
        <h1 class="page-title">设置</h1>
        <p class="page-desc">
          配置默写时的默认选项，进入默写页时会自动应用这些设置。
        </p>
      </div>
    </header>

    <n-card class="settings-card">
      <n-form label-placement="top" label-width="140" class="settings-form">
        <n-form-item label="默认隐藏模式">
          <n-radio-group v-model:value="form.defaultHideMode">
            <n-radio-button value="all">全部隐藏</n-radio-button>
            <n-radio-button value="random">随机隐藏</n-radio-button>
            <n-radio-button value="core">核心隐藏</n-radio-button>
            <n-radio-button value="level">按等级隐藏</n-radio-button>
          </n-radio-group>
        </n-form-item>

        <n-form-item v-if="form.defaultHideMode === 'random'" label="默认随机比例">
          <div class="ratio-row">
            <span class="ratio-value">{{ Math.round(form.defaultHideRatio * 100) }}%</span>
            <n-slider
              v-model:value="form.defaultHideRatio"
              :step="0.05"
              :min="0.1"
              :max="1"
              class="ratio-slider"
            />
          </div>
        </n-form-item>

        <n-form-item v-if="form.defaultHideMode === 'level'" label="默认词汇等级">
          <n-radio-group v-model:value="form.defaultVocabLevel">
            <n-radio-button value="B1">B1</n-radio-button>
            <n-radio-button value="B2">B2（含 B1）</n-radio-button>
            <n-radio-button value="C1">C1（含 B1+B2）</n-radio-button>
          </n-radio-group>
        </n-form-item>

        <n-form-item>
          <n-button type="primary" @click="handleSave">保存设置</n-button>
        </n-form-item>
      </n-form>
    </n-card>

    <n-card class="settings-card" title="数据导出与导入">
      <p class="data-desc">导出或导入「英文短文」和「练习统计数据」，便于备份或迁移。导入将覆盖当前所有短文和练习记录。</p>
      <n-space>
        <n-button @click="handleExport">导出数据</n-button>
        <n-button type="primary" secondary @click="triggerImport">导入数据</n-button>
        <input
          ref="importInputRef"
          type="file"
          accept=".json,application/json"
          class="hidden-file-input"
          @change="handleImport"
        />
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NButton, NCard, NForm, NFormItem, NRadioButton, NRadioGroup, NSpace, NSlider, useMessage } from 'naive-ui';
import { exportData, importData, loadAppSettings, saveAppSettings } from '../storage';
import type { AppSettings } from '../types';

const message = useMessage();
const importInputRef = ref<HTMLInputElement | null>(null);
const form = ref<AppSettings>({
  defaultHideMode: 'all',
  defaultHideRatio: 0.6,
  defaultVocabLevel: 'B1'
});

onMounted(() => {
  form.value = loadAppSettings();
});

function handleSave() {
  saveAppSettings(form.value);
  message.success('设置已保存');
}

function handleExport() {
  const data = exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const name = `keyboard-dictation-export-${new Date().toISOString().slice(0, 10)}.json`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
  message.success(`已导出 ${data.articles.length} 篇短文、${data.practiceRecords.length} 条练习记录`);
}

function triggerImport() {
  importInputRef.value?.click();
}

function handleImport(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  if (!window.confirm('导入将覆盖当前所有英文短文和练习记录，是否继续？')) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const raw = JSON.parse(String(reader.result ?? ''));
      const result = importData(raw);
      if (result.success) {
        message.success(`导入成功：${result.articlesCount} 篇短文，${result.recordsCount} 条练习记录`);
      } else {
        message.error(result.error);
      }
    } catch {
      message.error('文件解析失败，请选择有效的 keyboard-dictation 导出文件');
    }
  };
  reader.onerror = () => message.error('读取文件失败');
  reader.readAsText(file, 'utf-8');
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: center;
}

.page-header-text {
  min-width: 0;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;
}

.page-desc {
  margin: 6px 0 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.settings-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.settings-form :deep(.n-form-item) {
  margin-bottom: 20px;
}

.ratio-row {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 400px;
}

.ratio-value {
  font-size: 14px;
  color: #333;
  min-width: 44px;
  flex-shrink: 0;
}

.ratio-slider {
  flex: 1;
  min-width: 0;
}

.data-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.hidden-file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}
</style>
