<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header-text">
        <h1 class="page-title">练习统计</h1>
        <p class="page-desc">
          按短文查看历次默写记录，帮助你发现薄弱环节并安排复习节奏。
        </p>
      </div>
    </header>

    <n-card class="stats-card">
      <n-tabs type="line" size="medium">
        <n-tab-pane name="by-article" tab="按短文汇总">
          <n-data-table
            :columns="summaryColumns"
            :data="articleSummaries"
            :bordered="false"
            :single-line="false"
          />
        </n-tab-pane>
        <n-tab-pane name="records" tab="全部练习记录">
          <n-data-table
            :columns="recordColumns"
            :data="records"
            :bordered="false"
            :single-line="false"
            :pagination="{ pageSize: 10 }"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NCard, NDataTable, NTabPane, NTabs, type DataTableColumns } from 'naive-ui';
import { loadArticles, loadPracticeRecords } from '../storage';
import type { Article, PracticeRecord } from '../types';

interface ArticleSummary {
  articleId: string;
  title: string;
  practiceCount: number;
  lastPracticedAt?: string;
  avgAccuracy: number;
  bestAccuracy: number;
}

const articles = computed<Article[]>(() => loadArticles());
const records = computed<PracticeRecord[]>(() => loadPracticeRecords());

const articleSummaries = computed<ArticleSummary[]>(() => {
  const map = new Map<string, ArticleSummary>();

  records.value.forEach((r) => {
    const key = r.articleId;
    let s = map.get(key);
    if (!s) {
      const article = articles.value.find((a) => a.id === key);
      s = {
        articleId: key,
        title: article?.title ?? r.articleTitleSnapshot,
        practiceCount: 0,
        lastPracticedAt: undefined,
        avgAccuracy: 0,
        bestAccuracy: 0
      };
      map.set(key, s);
    }

    s.practiceCount += 1;
    s.avgAccuracy += r.accuracy;
    s.bestAccuracy = Math.max(s.bestAccuracy, r.accuracy);
    if (!s.lastPracticedAt || r.practicedAt > s.lastPracticedAt) {
      s.lastPracticedAt = r.practicedAt;
    }
  });

  return Array.from(map.values()).map((s) => ({
    ...s,
    avgAccuracy: s.practiceCount > 0 ? s.avgAccuracy / s.practiceCount : 0
  }));
});

const summaryColumns: DataTableColumns<ArticleSummary> = [
  {
    title: '短文标题',
    key: 'title'
  },
  {
    title: '练习次数',
    key: 'practiceCount',
    width: 100
  },
  {
    title: '平均正确率',
    key: 'avgAccuracy',
    width: 120,
    render(row) {
      return `${(row.avgAccuracy * 100).toFixed(1)}%`;
    }
  },
  {
    title: '最高正确率',
    key: 'bestAccuracy',
    width: 120,
    render(row) {
      return `${(row.bestAccuracy * 100).toFixed(1)}%`;
    }
  },
  {
    title: '最近练习时间',
    key: 'lastPracticedAt',
    width: 180,
    render(row) {
      return row.lastPracticedAt ? new Date(row.lastPracticedAt).toLocaleString() : '-';
    }
  }
];

const recordColumns: DataTableColumns<PracticeRecord> = [
  {
    title: '短文标题快照',
    key: 'articleTitleSnapshot'
  },
  {
    title: '模式',
    key: 'hideMode',
    width: 120,
    render(row) {
      if (row.hideMode === 'all') return '全部隐藏';
      if (row.hideMode === 'random') return '随机隐藏';
      if (row.hideMode === 'level') return row.vocabLevel ? `按等级隐藏 (${row.vocabLevel})` : '按等级隐藏';
      if (row.hideMode === 'core') return '核心单词隐藏';
      return row.hideMode;
    }
  },
  {
    title: '随机比例',
    key: 'hideRatio',
    width: 120,
    render(row) {
      if (row.hideMode !== 'random') return '-';
      return `${(row.hideRatio * 100).toFixed(0)}%`;
    }
  },
  {
    title: '正确率',
    key: 'accuracy',
    width: 120,
    render(row) {
      return `${(row.accuracy * 100).toFixed(1)}%`;
    }
  },
  {
    title: '耗时',
    key: 'durationMs',
    width: 120,
    render(row) {
      if (!row.durationMs) return '-';
      const sec = row.durationMs / 1000;
      return `${sec.toFixed(1)}s`;
    }
  },
  {
    title: '练习时间',
    key: 'practicedAt',
    width: 180,
    render(row) {
      return new Date(row.practicedAt).toLocaleString();
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

.stats-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
</style>

