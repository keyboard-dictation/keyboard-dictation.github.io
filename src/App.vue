<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <n-layout has-sider class="app-layout">
        <n-layout-sider width="200" bordered content-style="padding: 16px 0;">
          <div class="logo">
            <img src="/keyboard-dictation-logo.png" alt="keyboard-dictation" class="logo-img" />
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
            <span class="header-title">英文短文默写助手</span>
          </n-layout-header>
          <n-layout-content class="app-content">
            <div class="content-inner">
              <router-view />
            </div>
          </n-layout-content>
        </n-layout>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { darkTheme, lightTheme, NConfigProvider, NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NMenu, NMessageProvider, type MenuOption } from 'naive-ui';

const router = useRouter();
const route = useRoute();

const theme = computed(() => lightTheme);

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
}

.logo-img {
  height: 36px;
  width: auto;
}

.app-header {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.header-title {
  font-size: 17px;
  font-weight: 600;
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
</style>

