# 🤖 AgnChat

AgnChat 是一个现代化的AI聊天机器人，基于 React + TypeScript 实现，具备多会话管理、WebSocket 实时通信、图片上传与智能功能切换等特性。

> 配合智能体工作流框架 [AgnFlow](https://github.com/jianduo1/agnflow) 的服务端模块作为后端

---

### 🚀 主要功能

1. **多会话管理**：新建、切换、删除、清空对话，状态本地持久化
2. **实时通信**：WebSocket 连接后端，支持流式 AI 回复
3. **图片上传与预览**：多图上传、本地预览、删除，自动切换相关功能按钮
4. **智能功能按钮**：根据图片状态切换（如深度思考、工具调用、图像生成、分类、推理、VQA、情感分析）
5. **主题与窗口模式**：多主题色、深浅色切换，窗口最大化/最小化
6. **界面与交互**：响应式布局，动画过渡，emoji 强化视觉，代码块/推理块/工具调用美化

---

### 🖼️ 功能页面截图

1. **欢迎页**
   
   ![欢迎页](https://raw.githubusercontent.com/jianduo1/agnchat/main/public/hello.png)

2. **多会话管理**
   
   ![多会话管理](https://raw.githubusercontent.com/jianduo1/agnchat/main/public/conversation.png)

3. **多模态交互**（待开发）
   
   ![多模态交互](https://raw.githubusercontent.com/jianduo1/agnchat/main/public/multi_modal.png)

4. **深度思考功能**
   
   ![深度思考](https://raw.githubusercontent.com/jianduo1/agnchat/main/public/deep_thinking.png)

5. **工具调用功能**
   
   ![工具调用](https://raw.githubusercontent.com/jianduo1/agnchat/main/public/tool_call.png)

---

### 🏗️ 技术栈

- React + TypeScript
- WebSocket
- CSS Modules + 主题变量
- 自定义 hooks（useConversations, useChatSocket）
- 全量类型提示

---

### 📦 目录说明

```
agnchat/
├── public/                # 公共静态资源（如logo等）
├── src/                   # 主源码目录
│   ├── assets/            # 静态资源
│   ├── components/        # UI 组件
│   ├── hooks/             # 自定义 hooks
│   ├── types/             # 类型定义
│   ├── App.tsx            # 主界面逻辑
│   ├── App.css            # 局部样式
│   ├── index.css          # 全局样式
│   ├── main.tsx           # 入口文件
│   └── vite-env.d.ts      # Vite 环境类型
├── index.html             # HTML 模板
├── package.json           # 项目依赖与脚本
├── package-lock.json      # 依赖锁定
├── tsconfig*.json         # TypeScript 配置
├── vite.config.ts         # Vite 构建配置
├── eslint.config.js       # 代码规范
└── README.md              # 项目说明文档
```

---

### ⚙️ 快速开始

1. 安装依赖：`pnpm install`
2. 启动开发：`pnpm run dev`
3. 访问本地：默认 http://localhost:5173
4. 需配合后端 WebSocket 服务
