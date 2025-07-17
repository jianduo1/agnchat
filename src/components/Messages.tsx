import React, {useEffect, useRef, useState} from "react";
import "../styles/Messages.css";

export type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

function formatReasoningBlocks(rawContent: string) {
  let html = rawContent
    .replace(/<reasoning>\s/g, "<details open class='reasoning-block'><summary> 🧠 深度思考</summary><div class='reasoning-content'>")
    .replace(/<\/reasoning>\s/g, "</div></details>")
    .replace("<conclusion>", "<div class='conclusion-block'>")
    .replace("</conclusion>", "</div>")
    .replace(/```([a-zA-Z0-9]*)\s([\s\S]*?)\s```/g, function (_, lang, code) {
      const lines = code.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
      const numbered = lines.map((line: string, idx: number) => `<span class="line-number">${idx + 1}</span> ${line}`).join("\n");
      return `<pre class="code-block scrollbar-thin">${lang}\n<code lang="${lang}">${numbered}</code></pre>`;
    });
  // 美化 <tool> 标签
  if (html.includes("</tool>")) {
    html = html.replace(/<tool>([\s\S]*?)<\/tool>/g, (_match, inner) => {
      // 提取 name, args, set_state
      const name = /<name>([\s\S\s]*?)<\/name>/.exec(inner)?.[1]?.trim() || "";
      const args = /<args>([\s\S]*?)<\/args>/.exec(inner)?.[1]?.trim() || "";
      const setState = /<set_state>([\s\S]*?)<\/set_state>/.exec(inner)?.[1]?.trim() || "";
      // 解析参数
      let argsHtml = "";
      if (args) {
        argsHtml = args.replace(/<([a-zA-Z0-9_]+)>([\s\S]*?)<\/1>/g, (_m, k, v) => {
          return `<div class='tool-arg'><span class='tool-arg-key'>${k}</span>: <span class='tool-arg-value'>${v}</span></div>`;
        });
      }
      return `<div class='tool-block'>
      <div class='tool-title'>🛠️ 工具调用：<span class='tool-name'>${name}</span></div>
      <div class='tool-args'>${argsHtml}</div>
      ${setState ? `<div class='tool-set-state'>➡️ 结果存为 <span class='tool-set-var'>${setState}</span></div>` : ""}
    </div>`;
    });
  }
  // 新增：美化 <tool_context> 标签为可折叠卡片，格式化 JSON
  if (html.includes("</tool_context>")) {
    html = html.replace(/<tool_context>([\s\S]*?)<\/tool_context>/g, (_match, inner) => {
      let pretty = inner;
      try {
        // 尝试格式化为 JSON
        const obj = JSON.parse(inner);
        pretty = JSON.stringify(obj, null, 2);
      } catch {
        // 不是合法 JSON，原样输出
        pretty = inner.trim();
      }
      // 用 <details> 折叠，默认展开，样式与 reasoning-block 类似
      return `<details open class='tool-context-block reasoning-block'><summary>🧩 工具上下文</summary><div class='tool-context-content reasoning-content'><pre class='tool-context-json'>${pretty}</pre></div></details>`;
    });
  }
  // 去除 tool-block 前后的多余换行，使卡片和文本紧贴
  html = html.replace(/\n?(<div class='tool-block'>[\s\S]*?<\/div>)\n?/g, "$1");
  // 去除所有多余的换行符，避免文本和卡片之间出现大空隙
  html = html.replace(/\n\n\n/g, "\n\n");
  html = html.replace(/\n---\n/g, "\n<hr>\n");
  return html;
}

// 右键菜单组件
const ContextMenu: React.FC<{
  x: number;
  y: number;
  onDelete: () => void;
  onClose: () => void;
}> = ({x, y, onDelete, onClose}) => {
  useEffect(() => {
    const handleClick = () => {
      onClose();
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [onClose]);

  return (
    <div className="zt-context-menu" style={{position: "fixed", top: y, left: x, zIndex: 9999, minWidth: 120}} onContextMenu={(e) => e.preventDefault()}>
      <button className="zt-context-menu-item" onClick={onDelete}>
        🗑️ 删除该消息
      </button>
    </div>
  );
};

const Messages: React.FC<{
  messages: Message[];
  onDelete: (id: string) => void;
  streamingAiMessage?: Message | null;
}> = ({messages, onDelete, streamingAiMessage}) => {
  const messagesRef = useRef<HTMLDivElement>(null);
  // 右键菜单状态
  const [menu, setMenu] = useState<{x: number; y: number; id: string} | null>(null);
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, streamingAiMessage]);

  return (
    <div className="messages scrollbar-thin" id="messages" ref={messagesRef}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`message ${msg.role === "ai" ? "ai-message" : "user-message"}`}
          onContextMenu={(e) => {
            e.preventDefault();
            setMenu({x: e.clientX, y: e.clientY, id: msg.id});
          }}
        >
          <div className="msg-content" 
            dangerouslySetInnerHTML={
              msg.role === "ai"
                ? {__html: formatReasoningBlocks(msg.content)}
                : {__html: (msg.content || '').replace(/\n/g, '<br/>')}
            }
          />
        </div>
      ))}
      {streamingAiMessage && (
        <div className="message ai-message">
          <div className="msg-content" dangerouslySetInnerHTML={{__html: formatReasoningBlocks(streamingAiMessage.content)}} />
        </div>
      )}
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onDelete={() => {
            onDelete(menu.id);
            setMenu(null);
          }}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
};

export default Messages;
