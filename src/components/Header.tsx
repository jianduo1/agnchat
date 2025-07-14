import React, {useState} from "react";

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

  const buttonStyle = {
    padding: "6px 18px",
    background: "var(--bg-color)",
    color: "var(--text-color)",
    border: "1.5px solid var(--main-color)",
    borderRadius: 18,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    zIndex: 2,
    whiteSpace: "nowrap" as const,
  };

  return (
    <div className="header" style={{position: "relative"}}>
      {/* 苹果风格窗口按钮+主题切换 */}
      <div style={{position: "absolute", left: 16, top: 16, display: "flex", gap: 8, zIndex: 10}} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <button className={`mac-circle-btn minimize${hovered ? " hovered" : ""}`} title="最小化" onClick={onMinimize}>
          <span style={{color: "#a88b00"}}>➖</span>
        </button>
        <button className={`mac-circle-btn maximize${hovered ? " hovered" : ""}`} title="最大化" onClick={onMaximize}>
          <span style={{color: "#1e7c3a"}}>➕</span>
        </button>
        <button className={`mac-circle-btn theme${hovered ? " hovered" : ""}`} title="切换主题色" onClick={handleThemeSwitch}>
          <span style={{color: "#005b7f"}}>{"</>"}</span>
        </button>
      </div>
      {/* 标题和按钮 */}
      <h1 style={{cursor: "default"}} title="AgnFlow 聊天室">
        🤖 AgnFlow 聊天室{" "}
        <span className="status" id="status">
          {status}
        </span>
      </h1>
      <div style={{position: "absolute", top: 60, left: 24, right: 24, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2}}>
        <div style={{display: "flex", gap: 24, overflowX: "auto", maxWidth: "100%", scrollbarWidth: "none", msOverflowStyle: "none"}}>
          <button id="newConvBtn" style={buttonStyle} onClick={onNewConv}>
            💬 新增对话
          </button>
          <button id="switchConvBtn" style={buttonStyle} onClick={onSwitchConv}>
            🔄 切换对话
          </button>
          <button id="clearHistoryBtn" style={buttonStyle} onClick={onClearHistory}>
            🗑️ 清空对话
          </button>
        </div>
        <div style={{display: "flex", gap: 12}}>
          <button className={`theme-toggle-btn ${isDarkMode ? "dark" : "light"}`} onClick={handleThemeToggle} title={isDarkMode ? "切换到亮色模式" : "切换到黑暗模式"}>
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
