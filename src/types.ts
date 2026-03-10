export type HideMode = 'all' | 'random' | 'level' | 'core';

export type VocabLevel = 'B1' | 'B2' | 'C1';

export type ThemeMode = 'light' | 'dark';

/** 应用设置（如默写页的默认隐藏模式、主题） */
export interface AppSettings {
  defaultHideMode: HideMode;
  defaultHideRatio: number; // 0-1，仅当 defaultHideMode 为 random 时生效
  defaultVocabLevel: VocabLevel; // 仅当 defaultHideMode 为 level 时生效
  theme: ThemeMode;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  coreWords: string[]; // 用户配置的核心单词
  createdAt: string;
  updatedAt: string;
  lastPracticedAt?: string;
}

export interface PracticeRecord {
  id: string;
  articleId: string;
  articleTitleSnapshot: string;
  hideMode: HideMode;
  hideRatio: number; // 0-1，用于 random 模式
  vocabLevel?: VocabLevel; // 用于 level 模式
  totalHiddenLetters: number;
  correctLetters: number;
  accuracy: number; // 0-1
  durationMs?: number;
  practicedAt: string;
}

/** 导出数据格式：英文短文 + 练习统计数据 */
export interface ExportData {
  version: number;
  exportedAt: string;
  articles: Article[];
  practiceRecords: PracticeRecord[];
}

// 全局常量由 Vite 在构建时注入
declare const __APP_COMMIT__: string;
declare const __APP_REPO__: string;

