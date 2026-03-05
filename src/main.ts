import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { createDiscreteApi, darkTheme, lightTheme, NConfigProvider, NMessageProvider } from 'naive-ui';
import App from './App.vue';
import { routes } from './router';

const app = createApp(App);

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

app.use(router);

app.component('NConfigProvider', NConfigProvider);
app.component('NMessageProvider', NMessageProvider);

app.mount('#app');

export const { message } = createDiscreteApi(['message'], {
  configProviderProps: {
    theme: lightTheme
  }
});

