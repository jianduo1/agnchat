import {useState} from "react";
import Header from "./components/Header";
import Messages from "./components/Messages";
import InputContainer from "./components/InputContainer";
import ConversationModal from "./components/ConversationModal";
import {useConversations} from "./hooks/useConversations";
import {useChatSocket} from "./hooks/useChatSocket";
import type {ChatMessage} from "./hooks/useChatSocket";
import type {ChatOptions} from "./types/chat";
import "./index.css";

function App() {
  // 会话管理
  const {conversations, currentId, createConversation, deleteConversation, switchConversation, fetchList} = useConversations();
  // 聊天WebSocket
  const {messages, status, isStreaming, streamingAiMessage, sendMessage, deleteMessage, clearMessages} = useChatSocket(currentId);
  // 输入区
  const [input, setInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [options, setOptions] = useState<ChatOptions>({
    reasoning: false,
    toolCall: false,
    imageDescription: false,
    imageClassification: false,
    visualReasoning: false,
    visualQA: false,
    imageSentiment: false,
  });
  // 弹窗
  const [modalOpen, setModalOpen] = useState(false);

  // 窗口模式
  const [mode, setMode] = useState<"normal" | "max" | "min">("normal");
  const handleMaximize = () => setMode("max");
  const handleMinimize = () => setMode("min");

  // 新建对话
  const handleNewConv = async () => {
    await createConversation();
    setInput("");
    setUploadedImages([]);
    clearMessages();
  };
  // 切换对话
  const handleSwitchConv = async () => {
    await fetchList();
    // 如果会话列表为空，自动创建新会话并关闭弹窗
    if (conversations.length === 0) {
      await createConversation();
      setInput("");
      setUploadedImages([]);
      clearMessages();
    } else {
      setModalOpen(true);
    }
  };
  // 切换对话
  const handleSwitchConvId = (id: string) => {
    switchConversation(id);
    setInput("");
    setUploadedImages([]);
    setModalOpen(false);
  };
  // 删除会话
  const handleDeleteConv = async (id: string) => {
    if (!window.confirm("确定要删除该对话及其所有消息吗？")) return;
    await deleteConversation(id);
    setInput("");
    setUploadedImages([]);
    clearMessages();
  };
  // 清空当前对话
  const handleClearHistory = async () => {
    if (!currentId) return;
    if (!window.confirm("确定要删除当前对话及其所有消息吗？")) return;
    await deleteConversation(currentId);
    await handleNewConv();
  };
  // 删除消息
  const handleDeleteMsg = (id: string) => {
    deleteMessage(id);
  };
  // 输入区
  const handleInputChange = (v: string) => setInput(v);
  // 发送消息
  const handleSend = (agentConfigs: Record<string, any>, content?: string) => {
    const sendContent = content !== undefined ? content : input;
    if (!sendContent.trim() || isStreaming) return;
    if (uploadedImages.length > 0) {
      console.log("发送消息时包含图片:", uploadedImages.length, "张");
    }
    sendMessage(sendContent, options, agentConfigs, uploadedImages);
    setInput("");
    setUploadedImages([]);
  };
  // 选项切换函数
  const handleToggleOption = (key: keyof ChatOptions) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  // 处理图片上传
  const handleImagesChange = (images: string[]) => {
    setUploadedImages(images);
  };
  return (
    <div
      className="chat-container"
      style={{
        width: mode === "max" ? "100vw" : mode === "min" ? "40vh" : "90vh",
        height: mode === "max" ? "100vh" : mode === "min" ? "95vh" : "90vh",
      }}
    >
      <Header onNewConv={handleNewConv} onSwitchConv={handleSwitchConv} onClearHistory={handleClearHistory} status={status === "connected" ? "🟢 连接成功" : status === "streaming" ? "🤖 流式回复中" : status === "disconnected" ? "🔴 连接断开" : "连接中..."} onMaximize={handleMaximize} onMinimize={handleMinimize} />
      {/* 内容区始终显示 */}
      <Messages messages={messages as ChatMessage[]} onDelete={handleDeleteMsg} streamingAiMessage={streamingAiMessage} />
      <InputContainer value={input} onChange={handleInputChange} onSend={handleSend} options={options} onToggleOption={handleToggleOption} onImagesChange={handleImagesChange} disabled={status !== "connected" && status !== "streaming"} />
      <ConversationModal open={modalOpen} conversations={conversations} currentId={currentId} onSwitch={handleSwitchConvId} onDelete={handleDeleteConv} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default App;
