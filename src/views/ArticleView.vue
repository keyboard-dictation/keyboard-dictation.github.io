<template>
  <div class="page" :class="{ 'theme-dark': isDark }" v-if="article">
    <header class="page-header">
      <div class="page-header-text">
        <h1 class="page-title">查看短文：《{{ article.title }}》</h1>
        <p class="page-desc">
          查看短文的完整内容和描述，可从这里跳转去默写或编辑。
        </p>
      </div>
      <n-space>
        <n-button @click="goBack">返回列表</n-button>
        <n-button @click="goEdit">编辑短文</n-button>
        <n-button type="primary" @click="goPractice">开始默写</n-button>
      </n-space>
    </header>

    <n-card class="main-card">
      <section class="section">
        <h2 class="section-title">描述信息</h2>
        <p v-if="article.description" class="section-text">
          {{ article.description }}
        </p>
        <p v-else class="section-text section-text-muted">暂无描述。</p>
      </section>

      <section class="section">
        <h2 class="section-title">
          短文内容
          <span class="section-sub">{{ contentLength }} 字符</span>
        </h2>
        <pre class="content-view">{{ article.content }}</pre>
      </section>

      <section class="section section-meta">
        <div class="meta-item">
          <span class="meta-label">创建时间</span>
          <span class="meta-value">{{ createdAtText }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">最近练习</span>
          <span class="meta-value">{{ lastPracticedText }}</span>
        </div>
      </section>
    </n-card>
  </div>

  <div v-else class="page" :class="{ 'theme-dark': isDark }">
    <n-card class="main-card empty-state">
      <div class="empty-state-text">未找到对应短文，可能已被删除。</div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton, NCard, NSpace, useMessage } from 'naive-ui';
import { loadArticles } from '../storage';
import type { Article } from '../types';

const router = useRouter();
const route = useRoute();
const message = useMessage();
const themeContext = inject<{ themeMode: { value: 'light' | 'dark' } } | undefined>('theme');
const isDark = computed(() => themeContext?.themeMode?.value === 'dark');

const article = ref<Article | null>(null);

onMounted(() => {
  const id = String(route.params.id);
  const found = loadArticles().find((a) => a.id === id);
  if (!found) {
    message.error('未找到该短文，已返回列表');
    router.replace('/articles');
    return;
  }
  article.value = found;
});

const contentLength = computed(() => {
  return article.value ? article.value.content.length : 0;
});

const createdAtText = computed(() => {
  if (!article.value?.createdAt) return '-';
  return new Date(article.value.createdAt).toLocaleString();
});

const lastPracticedText = computed(() => {
  if (!article.value?.lastPracticedAt) return '-';
  return new Date(article.value.lastPracticedAt).toLocaleString();
});

function goBack() {
  router.push('/articles');
}

function goPractice() {
  if (!article.value) return;
  router.push(`/practice/${article.value.id}`);
}

function goEdit() {
  if (!article.value) return;
  router.push(`/articles/${article.value.id}/edit`);
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
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
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

.main-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.section-sub {
  font-size: 12px;
  color: #999;
}

.section-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.section-text-muted {
  color: #999;
}

.content-view {
  margin: 0;
  padding: 12px 12px 10px;
  border-radius: 6px;
  background: #fafafa;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.section-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  font-size: 12px;
  color: #666;
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.meta-item {
  display: flex;
  gap: 6px;
}

.meta-label {
  color: #999;
}

.meta-value {
  color: #555;
}

/* 深色模式：正文区域深底浅字，保证可读 */
.theme-dark .page-desc {
  color: #9ca3af;
}

.theme-dark .section-title {
  color: #e5e7eb;
}

.theme-dark .section-sub {
  color: #9ca3af;
}

.theme-dark .section-text {
  color: #d1d5db;
}

.theme-dark .section-text-muted {
  color: #9ca3af;
}

.theme-dark .content-view {
  background: #1e1e22;
  color: #e5e7eb;
  border: 1px solid #2e2e32;
}

.theme-dark .section-meta {
  color: #9ca3af;
  border-top-color: #2e2e32;
}

.theme-dark .meta-label {
  color: #6b7280;
}

.theme-dark .meta-value {
  color: #d1d5db;
}

.empty-state {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.empty-state :deep(.n-card__content) {
  padding: 48px 24px;
  text-align: center;
  color: #666;
}

.theme-dark .empty-state-text,
.theme-dark .empty-state :deep(.n-card__content) {
  color: #9ca3af;
}
</style>

