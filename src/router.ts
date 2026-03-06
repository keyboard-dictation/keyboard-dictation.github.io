import type { RouteRecordRaw } from 'vue-router';
import ArticleListView from './views/ArticleListView.vue';
import ArticleEditView from './views/ArticleEditView.vue';
import ArticleView from './views/ArticleView.vue';
import PracticeView from './views/PracticeView.vue';
import StatsView from './views/StatsView.vue';
import SettingsView from './views/SettingsView.vue';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/articles'
  },
  {
    path: '/articles',
    name: 'articles',
    component: ArticleListView
  },
  {
    path: '/articles/new',
    name: 'article-new',
    component: ArticleEditView
  },
  {
    path: '/articles/:id/view',
    name: 'article-view',
    component: ArticleView,
    props: true
  },
  {
    path: '/articles/:id/edit',
    name: 'article-edit',
    component: ArticleEditView,
    props: true
  },
  {
    path: '/practice/:id',
    name: 'practice',
    component: PracticeView,
    props: true
  },
  {
    path: '/stats',
    name: 'stats',
    component: StatsView
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView
  }
];

