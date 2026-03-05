<p align="center">
  <img src="public/logo.png" alt="keyboard-dictation logo" height="88" />
</p>

## keyboard-dictation · 英文短文默写助手

基于 **Vue 3 + Naive UI + Vite + TypeScript** 的 Web 应用，用于英文短文默写与复习，帮助提升写作与语感。

- 在线地址：<https://keyboard-dictation.github.io/>
- 仓库地址：<https://github.com/keyboard-dictation/keyboard-dictation.github.io>

---

### 功能特性

- **短文管理**
  - 手动录入：标题 / 描述 / 正文内容
  - 列表展示：字数、创建时间、最近练习时间
  - 支持编辑、删除、一键开始默写

- **默写练习**
  - 逐字母输入，每个字母有独立下划线占位，自动跳过空格和标点
  - 支持鼠标点击任意位置开始输入，并自动滚动到合适视图位置
  - 隐藏模式：
    - 全部隐藏
    - 随机隐藏（可配置 10%–100%）
    - 按等级隐藏：基于 `Duolingo_Vocabulary_B1/B2/C1.json`，选择 B2 时会隐藏 B1+B2 中出现的单词，以此类推
  - 检查结果：高亮错误字母，给出本次正确率

- **练习统计**
  - 按短文汇总：练习次数、平均正确率、最高正确率、最近练习时间
  - 全部记录：每次练习的模式、随机比例 / 等级、正确率、耗时和时间戳

- **个性化设置**
  - 默认隐藏模式（全部 / 随机 / 按等级）
  - 默认随机隐藏比例、默认词汇等级

- **数据导出 / 导入**
  - 导出：英文短文 + 所有练习记录为 JSON 文件
  - 导入：覆盖本地数据，便于备份和在不同浏览器 / 设备间迁移

> 数据全部保存在浏览器 `localStorage` 中，不依赖后端，仅支持 Web 端。

---

### 技术栈

- **框架**：Vue 3 (Composition API)
- **UI 组件库**：Naive UI
- **构建工具**：Vite
- **语言**：TypeScript
- **包管理**：pnpm
- **部署**：GitHub Pages + GitHub Actions

---

### 本地开发

前置环境：

- Node.js **>= 18**
- pnpm（如未安装，可运行 `npm install -g pnpm`）

安装依赖：

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm dev
```

浏览器访问：<http://localhost:5173>

构建生产包：

```bash
pnpm build
```

打包结果输出到 `dist/` 目录。

---

### GitHub Pages 部署

本仓库默认通过 GitHub Pages 发布静态站点：

- 分支：`main`
- 工作流：`.github/workflows/deploy.yml`
- 部署流程：
  1. 将代码推送到 `main`；
  2. GitHub Actions 自动执行：
     - 使用 pnpm 安装依赖；
     - 执行 `pnpm build`；
     - 将 `dist/` 上传并部署到 GitHub Pages；
  3. 部署完成后，通过 `https://keyboard-dictation.github.io/` 访问。

如需在自己的仓库中复用，只需：

1. 拷贝 `deploy.yml` 到 `.github/workflows/`；
2. 在仓库 **Settings → Pages** 中选择 **Build and deployment: GitHub Actions**。

---

### 目录结构（核心部分）

```text
keyboard-dictation.github.io/
  public/
    favicon.svg           # 站点 favicon
    logo.svg / logo.png   # 项目 logo
    dicts/                # Duolingo B1/B2/C1 词汇表
  src/
    App.vue               # 主布局与导航
    main.ts               # 入口
    router.ts             # 路由配置
    types.ts              # 类型定义 & 导出结构
    storage.ts            # localStorage 存取与导出/导入逻辑
    vocab.ts              # B1/B2/C1 词表加载
    views/
      ArticleListView.vue # 短文列表与管理
      ArticleEditView.vue # 新增 / 编辑短文
      PracticeView.vue    # 默写界面
      StatsView.vue       # 练习统计
      SettingsView.vue    # 设置（默认配置、导出 / 导入）
```

---

### 开源协议

本项目使用 **MIT License**，详情见仓库中的 `LICENSE` 文件。
