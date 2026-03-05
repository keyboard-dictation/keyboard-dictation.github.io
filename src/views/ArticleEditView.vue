<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header-text">
        <h1 class="page-title">{{ isEdit ? '编辑短文' : '新增短文' }}</h1>
        <p class="page-desc">
          直接输入短文内容，将作为默写的原文。
        </p>
      </div>
      <n-space>
        <n-button @click="goBack">返回列表</n-button>
        <n-button type="primary" @click="handleSave">保存</n-button>
      </n-space>
    </header>

    <n-card class="form-card">
      <n-form :model="form" label-placement="top" label-width="140" class="article-form">
        <n-form-item label="标题" path="title" required>
          <n-input v-model:value="form.title" placeholder="请输入短文标题" maxlength="200" show-count />
        </n-form-item>

        <n-form-item label="描述" path="description">
          <n-input
            v-model:value="form.description"
            type="textarea"
            :rows="3"
            placeholder="简单描述短文内容或来源（选填）"
          />
        </n-form-item>

        <n-form-item label="短文内容（需要默写的部分）" path="content" required>
          <n-input
            v-model:value="form.content"
            type="textarea"
            :rows="16"
            placeholder="在此粘贴或输入英文短文，将作为默写的原文内容。"
            style="font-family: 'Consolas', 'Courier New', monospace;"
          />
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSpace,
  useMessage
} from 'naive-ui';
import { loadArticles, upsertArticle } from '../storage';
import type { Article } from '../types';

const router = useRouter();
const route = useRoute();
const message = useMessage();

const form = ref<Pick<Article, 'id' | 'title' | 'description' | 'content' | 'coreWords'>>({
  id: '',
  title: '',
  description: '',
  content: '',
  coreWords: []
});

const isEdit = computed(() => Boolean(route.params.id));

onMounted(() => {
  if (isEdit.value) {
    const id = String(route.params.id);
    const article = loadArticles().find((a) => a.id === id);
    if (article) {
      form.value = {
        id: article.id,
        title: article.title,
        description: article.description,
        content: article.content,
        coreWords: article.coreWords ?? []
      };
    } else {
      message.error('未找到该短文，已返回列表');
      router.replace('/articles');
    }
  } else {
    form.value.id = crypto.randomUUID();
  }
});

function goBack() {
  router.push('/articles');
}

function handleSave() {
  if (!form.value.title.trim()) {
    message.error('请填写标题');
    return;
  }
  if (!form.value.content.trim()) {
    message.error('请填写短文内容');
    return;
  }

  const now = new Date().toISOString();
  const existing = loadArticles().find((a) => a.id === form.value.id);
  const article: Article = {
    id: form.value.id || crypto.randomUUID(),
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    content: form.value.content,
    coreWords: [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    lastPracticedAt: existing?.lastPracticedAt
  };

  upsertArticle(article);
  message.success('保存成功');
  router.push('/articles');
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

.form-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.article-form :deep(.n-form-item) {
  margin-bottom: 20px;
}

.article-form :deep(.n-form-item:last-child) {
  margin-bottom: 0;
}
</style>

