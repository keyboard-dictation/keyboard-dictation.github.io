import type { Article, PracticeRecord, AppSettings, ExportData, ThemeMode } from './types';

const EXPORT_VERSION = 1;

const ARTICLE_KEY = 'beibeibei_articles';
const PRACTICE_KEY = 'beibeibei_practice_records';
const SETTINGS_KEY = 'beibeibei_settings';

const DEFAULT_SETTINGS: AppSettings = {
  defaultHideMode: 'all',
  defaultHideRatio: 0.6,
  defaultVocabLevel: 'B1',
  theme: 'light'
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadArticles(): Article[] {
  return safeParse<Article[]>(localStorage.getItem(ARTICLE_KEY), []);
}

export function saveArticles(articles: Article[]) {
  localStorage.setItem(ARTICLE_KEY, JSON.stringify(articles));
}

export function upsertArticle(article: Article) {
  const list = loadArticles();
  const idx = list.findIndex((a) => a.id === article.id);
  if (idx >= 0) {
    list[idx] = article;
  } else {
    list.unshift(article);
  }
  saveArticles(list);
}

export function deleteArticle(id: string) {
  const list = loadArticles().filter((a) => a.id !== id);
  saveArticles(list);
}

export function loadPracticeRecords(): PracticeRecord[] {
  return safeParse<PracticeRecord[]>(localStorage.getItem(PRACTICE_KEY), []);
}

export function savePracticeRecords(list: PracticeRecord[]) {
  localStorage.setItem(PRACTICE_KEY, JSON.stringify(list));
}

export function addPracticeRecord(record: PracticeRecord) {
  const list = loadPracticeRecords();
  list.unshift(record);
  savePracticeRecords(list);
}

export function loadAppSettings(): AppSettings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const mode = parsed.defaultHideMode ?? DEFAULT_SETTINGS.defaultHideMode;
    const level = parsed.defaultVocabLevel ?? DEFAULT_SETTINGS.defaultVocabLevel;
    const validLevel = level === 'B1' || level === 'B2' || level === 'C1' ? level : DEFAULT_SETTINGS.defaultVocabLevel;
    const validModes: HideMode[] = ['all', 'random', 'level', 'core'];
    const safeMode = validModes.includes(mode as HideMode) ? (mode as HideMode) : DEFAULT_SETTINGS.defaultHideMode;
    const theme = parsed.theme === 'dark' ? 'dark' : 'light';
    return {
      defaultHideMode: safeMode,
      defaultHideRatio:
        typeof parsed.defaultHideRatio === 'number' && parsed.defaultHideRatio >= 0 && parsed.defaultHideRatio <= 1
          ? parsed.defaultHideRatio
          : DEFAULT_SETTINGS.defaultHideRatio,
      defaultVocabLevel: validLevel,
      theme
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveAppSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** 导出练习数据：英文短文 + 练习统计 */
export function exportData(): ExportData {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    articles: loadArticles(),
    practiceRecords: loadPracticeRecords()
  };
}

function isArticle(x: unknown): x is Article {
  return (
    typeof x === 'object' &&
    x !== null &&
    'id' in x &&
    'title' in x &&
    'content' in x &&
    typeof (x as Article).id === 'string' &&
    typeof (x as Article).title === 'string' &&
    typeof (x as Article).content === 'string'
  );
}

function isPracticeRecord(x: unknown): x is PracticeRecord {
  return (
    typeof x === 'object' &&
    x !== null &&
    'id' in x &&
    'articleId' in x &&
    'accuracy' in x &&
    typeof (x as PracticeRecord).id === 'string' &&
    typeof (x as PracticeRecord).articleId === 'string' &&
    typeof (x as PracticeRecord).accuracy === 'number'
  );
}

/**
 * 导入练习数据（覆盖当前短文与练习记录）。
 * 返回 { success, articlesCount, recordsCount } 或 { success: false, error }。
 */
export function importData(
  raw: unknown
): { success: true; articlesCount: number; recordsCount: number } | { success: false; error: string } {
  if (typeof raw !== 'object' || raw === null || !('version' in raw)) {
    return { success: false, error: '无效的导出文件格式' };
  }
  const data = raw as Record<string, unknown>;
  const version = Number(data.version);
  if (!Number.isFinite(version) || version > EXPORT_VERSION) {
    return { success: false, error: '不支持的导出文件版本' };
  }
  const articlesRaw = Array.isArray(data.articles) ? data.articles : [];
  const recordsRaw = Array.isArray(data.practiceRecords) ? data.practiceRecords : [];
  const articles: Article[] = articlesRaw.filter(isArticle);
  const records: PracticeRecord[] = recordsRaw.filter(isPracticeRecord);
  saveArticles(articles);
  savePracticeRecords(records);
  return { success: true, articlesCount: articles.length, recordsCount: records.length };
}

