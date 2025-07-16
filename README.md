<div align="center">

  <h1>🤖 AgnChat</h1>
  <strong>Modern AI Chatbot Frontend</strong>
  <br>
  <strong>现代化 AI 聊天机器人前端</strong>
  <br>
  
  <a href="https://github.com/jianduo1/agnchat/stargazers"><img src="https://img.shields.io/github/stars/jianduo1/agnchat?style=social" alt="GitHub stars"></a>  <a href="https://github.com/jianduo1/agnchat/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License"></a>  <a href="https://github.com/jianduo1/agnchat"><img src="https://img.shields.io/badge/docs-latest-blue.svg" alt="Docs"></a>  <a href="https://github.com/jianduo1/agnflow"><img src="https://img.shields.io/badge/backend-AgnFlow-blueviolet" alt="AgnFlow Backend"></a>
</div>

AgnChat 是一个现代化的AI聊天机器人，基于 React + TypeScript 实现，具备多会话管理、WebSocket 实时通信、图片上传与智能功能切换等特性。

> 后端项目：配合智能体工作流框架 [AgnFlow](https://github.com/jianduo1/agnflow) 的服务端模块作为后端

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

| 功能 | 截图 |
| :---: | :---: |
| 欢迎页 | <img src="https://raw.githubusercontent.com/jianduo1/agnchat/main/public/hello.png" width="400"/> |
| 多会话管理 | <img src="https://raw.githubusercontent.com/jianduo1/agnchat/main/public/conversation.png" width="400"/> |
| 多模态交互（待开发） | <img src="https://raw.githubusercontent.com/jianduo1/agnchat/main/public/multi_modal.png" width="400"/> |
| 深度思考功能 | <img src="https://raw.githubusercontent.com/jianduo1/agnchat/main/public/deep_thinking.png" width="400"/> |
| 工具调用功能 | <img src="https://raw.githubusercontent.com/jianduo1/agnchat/main/public/tool_call.png" width="400"/> |

---

### 🏗️ 技术栈

- React + TypeScript
- WebSocket
- CSS Modules + 主题变量
- 自定义 hooks（useConversations, useChatSocket）
- 全量类型提示

---

### ⚙️ 快速开始

1. 安装依赖：`pnpm install`
2. 启动开发：`pnpm run dev`
3. 访问本地：默认 http://localhost:5173
4. 需配合后端 WebSocket 服务

---

# 🤝 贡献 Contributing

我们欢迎贡献！请随时提交 Pull Request。
<br>
We welcome contributions! Please feel free to submit a Pull Request.

# 📄 许可证 License

本项目基于 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
<br>
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

# 📞 联系方式与社区

<div align="center">
  <p><strong>💬 加入我们的社区，参与讨论、提问和协作！</strong></p>
  
  <table align="center">
    <tr>
      <td align="center" style="padding: 0 20px;">
        <img src="https://raw.githubusercontent.com/jianduo1/agnflow/main/assets/wx.jpg" alt="个人微信二维码" width="150" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <br>
        <strong>个人微信</strong>
        <br>
        <em>直接联系维护者</em>
      </td>
      <td align="center" style="padding: 0 20px;">
        <img src="https://raw.githubusercontent.com/jianduo1/agnflow/main/assets/wxg.jpg" alt="社群微信群二维码" width="150" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <br>
        <strong>开发者社群</strong>
        <br>
        <em>加入我们的开发者社区</em>
      </td>
    </tr>
  </table>
  
  <p><em>欢迎随时联系我们，提出问题、建议或只是打个招呼！👋</em></p>
</div>

---

<div align="center">
  <strong>If you find this project helpful, please give it a ⭐️ Star!</strong>
  <br>
  <strong>如果这个项目对你有帮助，请给它一个 ⭐️ Star！</strong>
  <br>
  <em>Your support is my motivation to keep improving 💪</em>
  <br><br>
  <em>你的支持是我持续改进的动力 💪</em>
  <br><br>
</div>

---
