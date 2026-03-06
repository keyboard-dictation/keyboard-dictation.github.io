<template>
  <div class="page" v-if="article">
    <header class="page-header">
      <div class="page-header-text">
        <h1 class="page-title">默写：《{{ article.title }}》</h1>
        <p class="page-desc">
          切换隐藏模式或随机比例会即时生成默写内容，支持键盘或鼠标点选位置输入。
        </p>
      </div>
      <n-button @click="goBack">返回列表</n-button>
    </header>

    <n-collapse class="config-card" :default-expanded-names="['config']" arrow-placement="right">
      <n-collapse-item v-if="article.description" title="描述信息" name="desc">
        <div class="description-content">{{ article.description }}</div>
      </n-collapse-item>
      <n-collapse-item title="默写配置" name="config">
        <n-space vertical :size="20">
          <div class="config-row">
            <span class="config-label">隐藏模式</span>
            <n-radio-group v-model:value="hideMode" @update:value="onConfigChange">
              <n-radio-button value="all">全部隐藏</n-radio-button>
              <n-radio-button value="random">随机隐藏</n-radio-button>
              <n-radio-button value="core">核心隐藏</n-radio-button>
              <n-radio-button value="level">按等级隐藏</n-radio-button>
            </n-radio-group>
          </div>

          <div v-if="hideMode === 'random'" class="config-row">
            <span class="config-label">随机比例</span>
            <n-slider
              v-model:value="hideRatio"
              :step="0.05"
              :min="0.1"
              :max="1"
              style="width: 240px; margin: 0 12px;"
              @update:value="onConfigChange"
            />
            <span class="config-value">{{ Math.round(hideRatio * 100) }}%</span>
          </div>

          <div v-if="hideMode === 'level'" class="config-row">
            <span class="config-label">词汇等级</span>
            <n-radio-group v-model:value="vocabLevel" @update:value="onConfigChange">
              <n-radio-button value="B1">B1</n-radio-button>
              <n-radio-button value="B2">B2（含 B1）</n-radio-button>
              <n-radio-button value="C1">C1（含 B1+B2）</n-radio-button>
            </n-radio-group>
          </div>

          <p v-if="configLoading" class="stats-text">加载词表中…</p>
          <p v-else-if="statsText" class="stats-text">{{ statsText }}</p>
        </n-space>
      </n-collapse-item>
    </n-collapse>

    <n-card v-if="segments.length > 0" class="practice-card" title="默写区域">
      <div class="practice-wrapper" @click="focusInput">
        <div class="practice-text">
          <template v-for="(group, gi) in segmentGroups" :key="gi">
            <span v-if="group.type === 'word'" class="practice-word">
              <template v-for="(seg, si) in group.segments" :key="group.startIndex + si">
                <span
                  class="letter-wrapper"
                  :class="{ 'active-cell': seg.hidden && currentIndex === group.startIndex + si }"
                  :data-segment-index="group.startIndex + si"
                  @click.stop="onSegmentClick(group.startIndex + si)"
                >
                  <span
                    class="letter-display"
                    :class="{
                      dim: seg.hidden,
                      error: seg.hidden && seg.checked && !seg.correct
                    }"
                  >
                    {{ seg.hidden ? (seg.userInput || ' ') : seg.char }}
                  </span>
                  <span
                    class="underline"
                    :class="{
                      active: seg.hidden && currentIndex === group.startIndex + si,
                      error: seg.hidden && seg.checked && !seg.correct
                    }"
                  ></span>
                </span>
              </template>
            </span>
            <template v-else>
              <span
                v-for="(seg, si) in group.segments"
                :key="group.startIndex + si"
                class="non-letter"
                :class="{ 'word-space': seg.char === ' ' }"
                @click.stop="onSegmentClick(group.startIndex + si)"
              >{{ seg.char }}</span>
            </template>
          </template>
        </div>
        <input
          ref="hiddenInputRef"
          class="hidden-input"
          type="text"
          autocomplete="off"
          @keydown.prevent.stop="handleKeydown"
        />
      </div>

      <div class="practice-actions">
        <n-space>
          <n-button @click="resetPractice">重置本次练习</n-button>
          <n-button type="primary" @click="checkResult">检查结果并记录</n-button>
        </n-space>
        <div v-if="resultSummary" class="result-summary">{{ resultSummary }}</div>
      </div>
    </n-card>
  </div>

  <n-card v-else class="main-card" content-style="padding: 48px 24px; text-align: center; color: #666;">
    未找到对应短文，可能已被删除。
  </n-card>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NButton,
  NCollapse,
  NCollapseItem,
  NCard,
  NRadioButton,
  NRadioGroup,
  NSpace,
  NSlider,
  useMessage
} from 'naive-ui';
import { addPracticeRecord, loadArticles, loadAppSettings, saveArticles } from '../storage';
import type { Article, HideMode, VocabLevel } from '../types';
import { getVocabSet } from '../vocab';

interface Segment {
  char: string;
  type: 'letter' | 'other';
  hidden: boolean;
  userInput: string;
  correct: boolean;
  checked: boolean;
}

const router = useRouter();
const route = useRoute();
const message = useMessage();

const article = ref<Article | null>(null);
const hideMode = ref<HideMode>('all');
const hideRatio = ref(0.6);
const vocabLevel = ref<VocabLevel>('B1');
const configLoading = ref(false);
const segments = ref<Segment[]>([]);
const currentIndex = ref<number | null>(null);
const hiddenInputRef = ref<HTMLInputElement | null>(null);
const resultSummary = ref('');
const startedAt = ref<number | null>(null);

const statsText = computed(() => {
  if (!article.value?.lastPracticedAt) return '';
  return `上次练习时间：${new Date(article.value.lastPracticedAt).toLocaleString()}`;
});

/** 将 segments 按「单词」与「非字母」分组，保证换行时不会把单词拆开 */
const segmentGroups = computed(() => {
  const list = segments.value;
  if (!list.length) return [];
  const groups: { type: 'word' | 'other'; segments: Segment[]; startIndex: number }[] = [];
  let i = 0;
  while (i < list.length) {
    const seg = list[i];
    const type = seg.type === 'letter' ? 'word' : 'other';
    const startIndex = i;
    const segs: Segment[] = [];
    while (i < list.length && (list[i].type === 'letter') === (type === 'word')) {
      segs.push(list[i]);
      i++;
    }
    groups.push({ type, segments: segs, startIndex });
  }
  return groups;
});

onMounted(() => {
  const id = String(route.params.id);
  const found = loadArticles().find((a) => a.id === id) ?? null;
  article.value = found;
  const settings = loadAppSettings();
  hideMode.value = settings.defaultHideMode;
  hideRatio.value = settings.defaultHideRatio;
  vocabLevel.value = settings.defaultVocabLevel;
  if (article.value) {
    startPractice();
  }
});

function goBack() {
  router.push('/articles');
}

function isLetter(ch: string) {
  return /[A-Za-z]/.test(ch);
}

// 核心隐藏模式下保留显示的高频功能词（不隐藏）
const CORE_VISIBLE_WORDS = new Set(
  [
    // 人称代词 & 指示代词
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'this',
    'that',
    'these',
    'those',
    // 冠词
    'a',
    'an',
    'the',
    // be 动词
    'am',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    // 助动词 / 情态动词
    'do',
    'does',
    'did',
    'have',
    'has',
    'had',
    'will',
    'would',
    'can',
    'could',
    'shall',
    'should',
    'may',
    'might',
    'must',
    // 连接词
    'and',
    'or',
    'but',
    'so',
    // 常见介词
    'in',
    'on',
    'at',
    'of',
    'for',
    'to',
    'from',
    'with',
    'by',
    'about',
    'as',
    // 其他常见功能词
    'not',
    'very'
  ].map((w) => w.toLowerCase())
);

/** 将中文/全角标点规范为英文（半角）标点，保证默写界面统一使用英文标点 */
function normalizeToEnglishPunctuation(text: string): string {
  const map: Record<string, string> = {
    '\uFF0C': ',',  // 全角逗号
    '\u3002': '.',  // 中文句号
    '\uFF01': '!',  // 全角叹号
    '\uFF1F': '?',  // 全角问号
    '\uFF1B': ';',  // 全角分号
    '\uFF1A': ':',  // 全角冒号
    '\u201C': '"',  // 左双引号
    '\u201D': '"',  // 右双引号
    '\u2018': "'",  // 左单引号
    '\u2019': "'",  // 右单引号
    '\uFF08': '(',  // 全角左括号
    '\uFF09': ')',  // 全角右括号
    '\uFF3B': '[',  // 全角左方括号
    '\uFF3D': ']',  // 全角右方括号
    '\u2026': '...' // 省略号
  };
  return Array.from(text)
    .map((ch) => map[ch] ?? ch)
    .join('');
}

async function buildSegments() {
  if (!article.value) return;
  const raw = article.value.content ?? '';
  const content = normalizeToEnglishPunctuation(raw);
  const chars = Array.from(content);
  const segs: Segment[] = chars.map((ch) => ({
    char: ch,
    type: isLetter(ch) ? 'letter' : 'other',
    hidden: false,
    userInput: '',
    correct: true,
    checked: false
  }));

  const letterIndices = segs
    .map((s, i) => (s.type === 'letter' ? i : -1))
    .filter((i) => i >= 0);

  let indicesToHide: number[] = [];
  if (hideMode.value === 'all') {
    indicesToHide = letterIndices;
  } else if (hideMode.value === 'random') {
    const total = letterIndices.length;
    const target = Math.max(1, Math.round(total * hideRatio.value));
    const shuffled = [...letterIndices].sort(() => Math.random() - 0.5);
    indicesToHide = shuffled.slice(0, target);
  } else if (hideMode.value === 'core') {
    const words = content.split(/(\s+)/);
    let pos = 0;
    for (const w of words) {
      const plain = w.replace(/[^A-Za-z]/g, '').toLowerCase();
      if (plain && !CORE_VISIBLE_WORDS.has(plain)) {
        for (let i = 0; i < w.length; i++) {
          if (pos + i < segs.length && isLetter(w[i])) {
            indicesToHide.push(pos + i);
          }
        }
      }
      pos += w.length;
    }
  } else if (hideMode.value === 'level') {
    configLoading.value = true;
    try {
      const vocabSet = await getVocabSet(vocabLevel.value);
      const words = content.split(/(\s+)/);
      let pos = 0;
      for (const w of words) {
        const plain = w.replace(/[^A-Za-z]/g, '').toLowerCase();
        if (plain && vocabSet.has(plain)) {
          for (let i = 0; i < w.length; i++) {
            if (pos + i < segs.length && isLetter(w[i])) {
              indicesToHide.push(pos + i);
            }
          }
        }
        pos += w.length;
      }
    } finally {
      configLoading.value = false;
    }
  }

  indicesToHide.forEach((idx) => {
    segs[idx].hidden = true;
    segs[idx].userInput = '';
    segs[idx].correct = true;
    segs[idx].checked = false;
  });

  segments.value = segs;
  resultSummary.value = '';
  startedAt.value = Date.now();

  currentIndex.value = nextHiddenIndexFrom(-1);
  focusInput();
}

function nextHiddenIndexFrom(start: number | null): number | null {
  if (start === null) start = -1;
  for (let i = start + 1; i < segments.value.length; i++) {
    if (segments.value[i].hidden) return i;
  }
  return null;
}

function focusInput() {
  nextTick(() => {
    hiddenInputRef.value?.focus({ preventScroll: true });
  });
}

/** 将当前待输入位置对应的字母格滚动到可视区域 */
function scrollActiveCellIntoView() {
  const idx = currentIndex.value;
  if (idx == null) return;
  nextTick(() => {
    const el = document.querySelector(`[data-segment-index="${idx}"]`);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  });
}

/** 点击某处时，将待输入位置设为该处（或该处之后的第一个待填字母），并滚动到可视区域 */
function onSegmentClick(index: number) {
  const seg = segments.value[index];
  if (seg.type === 'letter' && seg.hidden) {
    currentIndex.value = index;
  } else {
    const next = nextHiddenIndexFrom(index);
    currentIndex.value = next;
  }
  nextTick(() => {
    scrollActiveCellIntoView();
    hiddenInputRef.value?.focus({ preventScroll: true });
  });
}

function startPractice() {
  if (!article.value) return;
  buildSegments().catch(() => {});
}

/** 切换隐藏模式、随机比例或词汇等级时重新生成默写内容 */
function onConfigChange() {
  if (!article.value) return;
  buildSegments().catch(() => {});
}

function resetPractice() {
  buildSegments().catch(() => {});
}

function handleKeydown(e: KeyboardEvent) {
  if (!segments.value.length) return;

  if (e.key === 'Backspace') {
    if (currentIndex.value === null) return;
    const idx = currentIndex.value;
    const seg = segments.value[idx];
    if (!seg.hidden) return;
    seg.userInput = '';
    seg.checked = false;
    seg.correct = true;
    const prevIdx = (() => {
      for (let i = idx - 1; i >= 0; i--) {
        if (segments.value[i].hidden) return i;
      }
      return null;
    })();
    currentIndex.value = prevIdx;
    return;
  }

  if (e.key.length === 1) {
    const ch = e.key;
    if (!/[A-Za-z]/.test(ch)) return;
    if (currentIndex.value === null) return;
    const seg = segments.value[currentIndex.value];
    if (!seg.hidden) return;
    seg.userInput = ch;
    const nextIdx = nextHiddenIndexFrom(currentIndex.value);
    currentIndex.value = nextIdx;
    return;
  }
}

function checkResult() {
  if (!segments.value.length || !article.value) return;
  let totalHidden = 0;
  let correct = 0;

  segments.value.forEach((seg) => {
    if (!seg.hidden) return;
    totalHidden++;
    seg.checked = true;
    if (!seg.userInput) {
      seg.correct = false;
      return;
    }
    seg.correct = seg.userInput.toLowerCase() === seg.char.toLowerCase();
    if (seg.correct) correct++;
  });

  if (totalHidden === 0) {
    message.warning('当前配置下没有需要填写的字母，请调整隐藏模式或比例。');
    return;
  }

  const accuracy = correct / totalHidden;
  const durationMs = startedAt.value ? Date.now() - startedAt.value : undefined;
  resultSummary.value = `本次正确率：${(accuracy * 100).toFixed(1)}%（${correct}/${totalHidden}）`;

  addPracticeRecord({
    id: crypto.randomUUID(),
    articleId: article.value.id,
    articleTitleSnapshot: article.value.title,
    hideMode: hideMode.value,
    hideRatio: hideRatio.value,
    vocabLevel: hideMode.value === 'level' ? vocabLevel.value : undefined,
    totalHiddenLetters: totalHidden,
    correctLetters: correct,
    accuracy,
    durationMs,
    practicedAt: new Date().toISOString()
  });

  // 更新短文最近练习时间
  const list = loadArticles();
  const idx = list.findIndex((a) => a.id === article.value?.id);
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      lastPracticedAt: new Date().toISOString()
    };
    saveArticles(list);
  }

  message.success('已记录本次练习结果');
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

.config-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.description-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
}

.config-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.config-label {
  font-size: 14px;
  color: #333;
  min-width: 72px;
}

.config-value {
  font-size: 14px;
  color: #666;
  min-width: 36px;
}

.main-card,
.practice-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.practice-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--n-border-color);
}

.practice-wrapper {
  position: relative;
  cursor: text;
}

.practice-text {
  line-height: 2.0;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 16px;
  white-space: pre-wrap;
}

/* 单词作为整体，换行时整词移到下一行，不拆开 */
.practice-word {
  display: inline-block;
  white-space: nowrap;
}

.letter-wrapper {
  position: relative;
  display: inline-block;
  min-width: 10px;
  height: 1.2em;
  margin-right: 3px;
  vertical-align: bottom;
  cursor: text;
}

.letter-wrapper.active-cell {
  background: rgba(24, 160, 88, 0.14);
  border-radius: 2px;
}

.letter-display {
  display: block;
  min-height: 0.95em;
  line-height: 1.08;
}

.letter-display.dim {
  color: #999;
}

.underline {
  /* 用 border 画线，避免 1px 背景在不同位置渲染粗细不一 */
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 0;
  width: 100%;
  min-width: 8px;
  flex-shrink: 0;
  border-bottom: 1px solid #ccc;
  box-sizing: border-box;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.underline.active {
  border-bottom: 2px solid #18a058;
  border-bottom-color: #18a058;
}

.underline.error {
  border-bottom-color: #d03050;
}

.letter-display.error {
  color: #d03050;
  background-color: rgba(208, 48, 80, 0.15);
}

.non-letter {
  white-space: pre;
  font-family: inherit;
  vertical-align: bottom;
  line-height: 1.1;
  cursor: text;
}

/* 单词之间的空格加大，便于区分单词 */
.non-letter.word-space {
  display: inline-block;
  min-width: 0.5em;
  margin-right: 0.15em;
}

.hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.result-summary {
  font-weight: 500;
}

.stats-text {
  font-size: 13px;
  color: #666;
}
</style>

