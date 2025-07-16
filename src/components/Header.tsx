import React, {useState} from "react";
import "../styles/Header.css";

interface HeaderProps {
  onNewConv: () => void;
  onSwitchConv: () => void;
  onClearHistory: () => void;
  status: string;
  onMaximize: () => void;
  onMinimize: () => void;
}

const Header: React.FC<HeaderProps> = ({onNewConv, onSwitchConv, onClearHistory, status, onMaximize, onMinimize}) => {
  const [hovered, setHovered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // 默认黑暗模式

  const themeColors = ["#00B4DB", "#00ffe7", "#FFD93D", "#43E97B", "#ffb3b3", "#c3b6f7", "#FF8C42"];
  const [themeIndex, setThemeIndex] = useState(0);
  const handleThemeSwitch = () => {
    const nextIndex = (themeIndex + 1) % themeColors.length;
    setThemeIndex(nextIndex);
    document.documentElement.style.setProperty("--main-color", themeColors[nextIndex]);
  };

  // 黑暗模式切换功能
  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      // 切换到黑暗模式
      document.documentElement.style.setProperty("--bg-color", "var(--bg-dark-color)");
      document.documentElement.style.setProperty("--text-color", "var(--text-dark-color)");
      document.documentElement.classList.remove("light-mode");
      document.documentElement.style.setProperty("--code-color", "var(--code-dark-color)");
    } else {
      // 切换到亮色模式
      document.documentElement.style.setProperty("--bg-color", "var(--bg-light-color)");
      document.documentElement.style.setProperty("--text-color", "var(--text-light-color)");
      document.documentElement.classList.add("light-mode");
      document.documentElement.style.setProperty("--code-color", "var(--code-light-color)");
    }
  };

  return (
    <div className="header">
      {/* 苹果风格窗口按钮+主题切换 */}
      <div className="mac-buttons" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <button className={`mac-circle-btn minimize${hovered ? " hovered" : ""}`} title="最小化" onClick={onMinimize}>
          <span>➖</span>
        </button>
        <button className={`mac-circle-btn maximize${hovered ? " hovered" : ""}`} title="最大化" onClick={onMaximize}>
          <span>➕</span>
        </button>
        <button className={`mac-circle-btn theme${hovered ? " hovered" : ""}`} title="切换主题色" onClick={handleThemeSwitch}>
          <span>{"</>"}</span>
        </button>
      </div>
      {/* 标题和按钮 */}
      <h1 title="AgnFlow 聊天室">
        🤖 AgnFlow 聊天室{" "}
        <span className="status" id="status">
          {status}
        </span>
      </h1>
      <div className="header-controls">
        <div className="header-buttons">
          <button id="newConvBtn" className="header-btn" onClick={onNewConv}>
            💬 新增对话
          </button>
          <button id="switchConvBtn" className="header-btn" onClick={onSwitchConv}>
            🔄 切换对话
          </button>
          <button id="clearHistoryBtn" className="header-btn" onClick={onClearHistory}>
            🗑️ 清空对话
          </button>
        </div>
        <div className="theme-controls">
          <button className={`theme-toggle-btn ${isDarkMode ? "dark" : "light"}`} onClick={handleThemeToggle} title={isDarkMode ? "切换到亮色模式" : "切换到黑暗模式"}>
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
