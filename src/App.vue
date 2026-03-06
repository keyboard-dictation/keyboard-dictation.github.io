<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <n-layout has-sider class="app-layout">
        <n-layout-sider width="200" bordered content-style="padding: 16px 0;">
          <div class="logo">
            <div class="logo-main">
              <span class="logo-main-line">keyboard</span>
              <span class="logo-main-line">dictation</span>
            </div>
            <div class="logo-sub">英文短文默写助手</div>
          </div>
          <n-menu
            :options="menuOptions"
            :value="activeKey"
            @update:value="handleMenuSelect"
            style="margin-top: 8px;"
          />
        </n-layout-sider>
        <n-layout>
          <n-layout-header bordered class="app-header">
            <div class="app-header-inner">
              <div class="header-github">
                <a
                  href="https://github.com/keyboard-dictation/keyboard-dictation.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="github-link"
                  aria-label="Open keyboard-dictation on GitHub"
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true" class="github-icon">
                    <path
                      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                      0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
                      0-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
                      0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27
                      1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
                      0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </n-layout-header>
          <n-layout-content class="app-content">
            <div class="content-inner">
              <router-view />
              <footer class="app-footer">
                <span class="footer-item">MIT License</span>
                <span class="footer-sep">·</span>
                <a :href="appRepo" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>
                <span class="footer-sep">·</span>
                <span class="footer-item">Commit {{ appCommit }}</span>
                <span class="footer-sep">·</span>
                <span class="footer-item" id="busuanzi_container_site_pv">
                  访问量 <span id="busuanzi_value_site_pv">--</span>
                </span>
              </footer>
            </div>
          </n-layout-content>
        </n-layout>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { darkTheme, lightTheme, NConfigProvider, NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NMenu, NMessageProvider, type MenuOption } from 'naive-ui';

const router = useRouter();
const route = useRoute();

const theme = computed(() => lightTheme);
const appCommit = __APP_COMMIT__;
const appRepo = __APP_REPO__;

const menuOptions: MenuOption[] = [
  {
    label: '短文列表',
    key: '/articles'
  },
  {
    label: '新增短文',
    key: '/articles/new'
  },
  {
    label: '练习统计',
    key: '/stats'
  },
  {
    label: '设置',
    key: '/settings'
  }
];

const activeKey = computed(() => {
  if (route.path.startsWith('/articles') && !route.path.includes('new')) {
    return '/articles';
  }
  if (route.path.includes('new')) {
    return '/articles/new';
  }
  if (route.path.startsWith('/stats')) {
    return '/stats';
  }
  if (route.path.startsWith('/settings')) {
    return '/settings';
  }
  return '/articles';
});

const currentPageTitle = computed(() => {
  const path = route.path;
  if (path.startsWith('/articles/') && path.includes('/view')) return '查看短文';
  if (path.startsWith('/articles') && !path.includes('new')) return '短文列表';
  if (path.includes('new')) return '新增短文';
  if (path.startsWith('/practice')) return '默写练习';
  if (path.startsWith('/stats')) return '练习统计';
  if (path.startsWith('/settings')) return '设置';
  return 'keyboard‑dictation';
});

watch(
  currentPageTitle,
  (title) => {
    const suffix = 'keyboard-dictation';
    document.title = title ? `${title} - ${suffix}` : suffix;
  },
  { immediate: true }
);

function handleMenuSelect(key: string) {
  router.push(key);
}
</script>

<style scoped>
.app-layout {
  height: 100vh;
}

.logo {
  padding: 20px 24px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
}

.logo-main {
  text-align: center;
  line-height: 1.1;
}

.logo-main-line {
  display: block;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: linear-gradient(120deg, #18a058, #22c38a);
  -webkit-background-clip: text;
  color: transparent;
}

.logo-sub {
  font-size: 12px;
  color: #666;
}

.app-header {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.app-header-inner {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.header-github {
  display: flex;
  align-items: center;
}

.github-link {
  display: inline-flex;
  align-items: center;
  font-size: 0;
  color: #666;
  text-decoration: none;
}

.github-link:hover {
  color: #1f2328;
}

.github-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.app-content {
  padding: 24px;
  overflow: auto;
  background: #f5f6f8;
}

.content-inner {
  max-width: 1000px;
  margin: 0 auto;
}

.app-footer {
  margin-top: 32px;
  padding: 16px 0 8px;
  font-size: 12px;
  color: #999;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  border-top: 1px solid #e5e6eb;
}

.footer-item {
  white-space: nowrap;
}

.footer-sep {
  color: #ccc;
}

.footer-link {
  color: #666;
  text-decoration: none;
}

.footer-link:hover {
  color: #1f2328;
  text-decoration: underline;
}
</style>

