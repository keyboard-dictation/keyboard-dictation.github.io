/**
 * 按等级（B1/B2/C1）加载单词表，逐级加码：B1 仅 B1，B2 为 B1+B2，C1 为 B1+B2+C1。
 */

import type { VocabLevel } from './types';

interface VocabItem {
  name: string;
  trans?: string[];
  usphone?: string;
  ukphone?: string;
}

const CACHE: Partial<Record<VocabLevel, Set<string>>> = {};

async function fetchWordSet(level: 'B1' | 'B2' | 'C1'): Promise<Set<string>> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '') || '';
  const url = `${base}/dicts/Duolingo_Vocabulary_${level}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load vocabulary: ${level}`);
  const list = (await res.json()) as VocabItem[];
  const set = new Set<string>();
  for (const item of list) {
    if (item.name && typeof item.name === 'string') {
      set.add(item.name.toLowerCase().trim());
    }
  }
  return set;
}

/**
 * 获取指定等级的单词集合（逐级加码）。
 * B1 → 仅 B1 词表；B2 → B1 + B2；C1 → B1 + B2 + C1。
 */
export { type VocabLevel };

export async function getVocabSet(level: VocabLevel): Promise<Set<string>> {
  if (CACHE[level]) return CACHE[level]!;
  const sets: Set<string>[] = [];
  if (level === 'B1') {
    sets.push(await fetchWordSet('B1'));
  } else if (level === 'B2') {
    sets.push(await fetchWordSet('B1'));
    sets.push(await fetchWordSet('B2'));
  } else {
    sets.push(await fetchWordSet('B1'));
    sets.push(await fetchWordSet('B2'));
    sets.push(await fetchWordSet('C1'));
  }
  const merged = new Set<string>();
  for (const s of sets) {
    s.forEach((w) => merged.add(w));
  }
  CACHE[level] = merged;
  return merged;
}
