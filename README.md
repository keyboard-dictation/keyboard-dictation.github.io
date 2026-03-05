## keyboard-dictation - 英文短文默写助手

基于 **Vue 3 + Naive UI + Vite + TypeScript** 的 Web 应用，用于英文短文默写与复习。

### 功能概览

- **短文管理**：手动录入（标题、描述、正文）、列表展示、编辑、删除、开始默写
- **默写练习**：逐字母输入与下划线占位；隐藏模式（全部隐藏 / 随机隐藏 / 按等级 B1·B2·C1）；判错与正确率
- **练习统计**：按短文汇总、全部练习记录
- **设置**：默认隐藏模式与默认词汇等级

数据使用浏览器 `localStorage` 存储，仅支持 Web 端。

### 本地运行

前置要求：

- Node.js >= 18（建议使用最新 LTS）
- 已全局安装 pnpm（本项目已帮你安装过，如需手动：`npm install -g pnpm`）

安装依赖：

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm dev
```

浏览器访问 `http://localhost:5173`。

### 目录结构（核心部分）

```text
src/
  App.vue            # 主布局和侧边菜单
  main.ts            # 入口
  router.ts          # 路由配置
  types.ts           # 数据类型定义
  storage.ts         # localStorage 存取
  vocab.ts           # B1/B2/C1 词表加载
  views/
    ArticleListView.vue   # 短文列表与管理
    ArticleEditView.vue   # 新增/编辑短文
    PracticeView.vue      # 默写界面
    StatsView.vue         # 练习统计
    SettingsView.vue      # 设置
```
