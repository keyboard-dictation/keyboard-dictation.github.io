<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header-text">
        <h1 class="page-title">短文列表</h1>
        <p class="page-desc">管理已保存的英文短文，支持编辑、删除和开始默写。</p>
      </div>
      <n-button type="primary" @click="goNew">新增短文</n-button>
    </header>

    <n-card v-if="articles.length === 0" class="main-card" content-style="padding: 48px 24px; text-align: center; color: #666;">
      目前还没有短文，请点击右上角「新增短文」进行录入。
    </n-card>

    <n-card v-else class="main-card">
      <n-data-table
        :columns="columns"
        :data="articles"
        :bordered="false"
        :single-line="false"
        :pagination="{ pageSize: 10 }"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NCard, NDataTable, NSpace, type DataTableColumns } from 'naive-ui';
import { loadArticles, deleteArticle, saveArticles } from '../storage';
import type { Article } from '../types';

const router = useRouter();

const articles = computed<Article[]>(() => {
  return loadArticles();
});

function refresh() {
  // 触发 computed 重新计算，可以通过重新写入 localStorage 并修改一个 dummy key 来实现。
  // 简化：直接调用 saveArticles(loadArticles())，利用依赖跟踪。
  const list = loadArticles();
  saveArticles(list);
}

function goNew() {
  router.push('/articles/new');
}

function handleEdit(row: Article) {
  router.push(`/articles/${row.id}/edit`);
}

function handleView(row: Article) {
  router.push(`/articles/${row.id}/view`);
}

function handlePractice(row: Article) {
  router.push(`/practice/${row.id}`);
}

function handleDelete(row: Article) {
  if (!window.confirm(`确定要删除《${row.title}》吗？`)) return;
  deleteArticle(row.id);
  refresh();
}

const columns: DataTableColumns<Article> = [
  {
    title: '标题',
    key: 'title',
    width: 220
  },
  {
    title: '字数',
    key: 'content',
    width: 80,
    render(row) {
      return row.content.length;
    }
  },
  {
    title: '最近练习',
    key: 'lastPracticedAt',
    width: 160,
    render(row) {
      return row.lastPracticedAt ? new Date(row.lastPracticedAt).toLocaleString() : '-';
    }
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    render(row) {
      return new Date(row.createdAt).toLocaleString();
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 320,
    render(row) {
      return h(
        NSpace,
        { justify: 'end' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                onClick: () => handleView(row)
              },
              { default: () => '查看短文' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => handlePractice(row)
              },
              { default: () => '开始默写' }
            ),
            h(
              NButton,
              {
                size: 'small',
                tertiary: true,
                onClick: () => handleEdit(row)
              },
              { default: () => '编辑' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                tertiary: true,
                onClick: () => handleDelete(row)
              },
              { default: () => '删除' }
            )
          ]
        }
      );
    }
  }
];
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
</style>

