import React, {useRef, useState, useEffect} from "react";
import type {ChatOptions} from "../types/chat";
import "../styles/InputContainer.css";
import AgentCard from "./AgentCard";

const InputContainer: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  options: ChatOptions;
  onToggleOption: (key: keyof ChatOptions) => void;
  onImagesChange?: (images: string[]) => void;
  disabled?: boolean;
}> = ({value, onChange, onSend, options, onToggleOption, onImagesChange, disabled}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  // 多智能体卡片支持
  const [schemas, setSchemas] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null); // 选中按钮
  const [activeSchema, setActiveSchema] = useState<any>(null);
  const [showAgentCard, setShowAgentCard] = useState(false); // 显示卡片

  // 拉取所有智能体 schema
  useEffect(() => {
    fetch("/api/agent_nodes")
      .then((res) => res.json())
      .then((data) => setSchemas(Array.isArray(data) ? data : []));
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    autoResizeTextarea();
  };

  const autoResizeTextarea = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
      el.style.overflowY = el.scrollHeight > 120 ? "auto" : "hidden";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            newImages.push(result);
            const updatedImages = [...uploadedImages, result];
            setUploadedImages(updatedImages);
            onImagesChange?.(updatedImages);
          };
          reader.readAsDataURL(file);
        }
      });
    }
    // 清空input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // 插入换行
        const el = e.target as HTMLTextAreaElement;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        onChange(value.slice(0, start) + "\n" + value.slice(end));
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
          }
        }, 0);
        e.preventDefault();
      } else {
        e.preventDefault();
        onSend();
      }
    }
  };

  return (
    <div className="input-container">
      {/* 图片预览区域 */}
      {uploadedImages.length > 0 && (
        <div className="image-preview-container">
          {uploadedImages.map((image, index) => (
            <div key={index} className="image-preview-item">
              <img src={image} alt={`上传图片 ${index + 1}`} />
              <button className="image-remove-btn" onClick={() => removeImage(index)} title="删除图片">
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 功能按钮区域 */}
      <div className="button-bar">
        {uploadedImages.length > 0 ? (
          // 有图片时显示图像相关按钮
          <>
            <button id="imgDescButton" className={`deep-think-btn${options.imageDescription ? " active" : ""}`} onClick={() => onToggleOption("imageDescription")} type="button">
              🖼️ 图像生成
            </button>
            <button id="imgClsButton" className={`deep-think-btn${options.imageClassification ? " active" : ""}`} onClick={() => onToggleOption("imageClassification")} type="button">
              🏷️ 图像分类
            </button>
            <button id="visReasonButton" className={`deep-think-btn${options.visualReasoning ? " active" : ""}`} onClick={() => onToggleOption("visualReasoning")} type="button">
              🤔 视觉推理
            </button>
            <button id="vqaButton" className={`deep-think-btn${options.visualQA ? " active" : ""}`} onClick={() => onToggleOption("visualQA")} type="button">
              ❓ 视觉问答（VQA）
            </button>
            <button id="imgSentimentButton" className={`deep-think-btn${options.imageSentiment ? " active" : ""}`} onClick={() => onToggleOption("imageSentiment")} type="button">
              😊 图像情感分析
            </button>
          </>
        ) : (
          // 没有图片时显示默认按钮
          <>
            <button id="thinkButton" className={`deep-think-btn${options.reasoning ? " active" : ""}`} onClick={() => onToggleOption("reasoning")} type="button">
              🧠 深度思考
            </button>
            <button id="toolCallButton" className={`deep-think-btn${options.toolCall ? " active" : ""}`} onClick={() => onToggleOption("toolCall")} type="button">
              🔧 工具调用
            </button>
          </>
        )}
        {/* 多个智能体按钮，排在后面 */}
        {Array.isArray(schemas) &&
          schemas.map((schema) => (
            <div className="agent-btn-group" key={schema.name} style={{display: "inline-block", marginRight: 8}}>
              <button className={`deep-think-btn${selectedAgent === schema.name ? " active" : ""}`} onClick={() => setSelectedAgent(selectedAgent === schema.name ? null : schema.name)} type="button">
                {schema.label}
              </button>
              {selectedAgent === schema.name && (
                <button
                  className="agent-edit-btn"
                  title="配置智能体"
                  onClick={() => {
                    setActiveSchema(schema);
                    setShowAgentCard(true);
                  }}
                  type="button"
                >
                  ＋
                </button>
              )}
            </div>
          ))}
      </div>

      <textarea id="messageInput" ref={textareaRef} placeholder="给 AgnFlow 发送消息" rows={1} style={{resize: "none"}} value={value} onChange={handleInput} onKeyDown={onKeyDown} disabled={disabled} />

      {/* 文件上传按钮 */}
      <button id="uploadButton" className="icon-btn" onClick={handleUploadClick} title="上传文件">
        📎
      </button>

      {/* 发送按钮 */}
      <button id="sendButton" disabled={disabled || value.trim() === ""} onClick={onSend} title="发送消息">
        ➤
      </button>

      {/* 隐藏的文件输入 */}
      <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileUpload} style={{display: "none"}} />

      {/* 智能体卡片弹窗 */}
      {showAgentCard && activeSchema && (
        <div className="agent-modal-overlay" onClick={() => setShowAgentCard(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <AgentCard
              formFields={activeSchema.fields}
              agentData={{
                name: "",
                type: "chat",
                capabilities: [],
                model: "",
                description: "",
                config: "",
                tags: [],
                link: "",
                files: [],
                ...Object.fromEntries((activeSchema.fields || []).map((f) => [f.name, f.default ?? ""])),
                ...(schemas.find((s) => s.name === activeSchema.name)?.data || {}),
              }}
              label={activeSchema.label}
              onSelect={() => setShowAgentCard(false)}
              onConfigChange={(data) => {
                setSchemas((prev) => prev.map((s) => (s.name === activeSchema.name ? {...s, data} : s)));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InputContainer;
