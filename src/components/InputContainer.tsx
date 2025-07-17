import React, {useRef, useState, useEffect} from "react";
import type {ChatOptions} from "../types/chat";
import "../styles/InputContainer.css";
import AgentCard from "./AgentCard";

const InputContainer: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onSend: (agentConfigs: Record<string, any>, content: string) => void;
  options: ChatOptions;
  onToggleOption: (key: keyof ChatOptions) => void;
  onImagesChange?: (images: string[]) => void;
  disabled?: boolean;
}> = ({value, onChange, onSend, options, onToggleOption, onImagesChange, disabled}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]); // 新增，保存file_id
  // 多智能体卡片支持
  const [schemas, setSchemas] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null); // 选中按钮
  const [activeSchema, setActiveSchema] = useState<any>(null);
  const [showAgentCard, setShowAgentCard] = useState(false); // 显示卡片
  const [agentConfigs, setAgentConfigs] = useState<Record<string, any>>({});

  // 拉取所有智能体 schema
  useEffect(() => {
    fetch("/api/agent_nodes")
      .then((res) => res.json())
      .then((data) => {
        const agentList = Array.isArray(data) ? data : [];
        setSchemas(agentList);
      });
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          // 先预览
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setUploadedImages((prev) => [...prev, result]);
            onImagesChange?.([...uploadedImages, result]);
          };
          reader.readAsDataURL(file);
          // 上传到后端
          const formData = new FormData();
          formData.append('file', file);
          try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.file_id) {
              setUploadedFileIds((prev) => [...prev, data.file_id]);
              // 假设vision_node为entry_action
              setAgentConfigs((prev) => ({
                ...prev,
                vision_node: {
                  ...(prev.vision_node || {}),
                  image_file_id: data.file_id,
                },
              }));
            }
          } catch (err) {
            console.error('图片上传失败', err);
            alert('图片上传失败');
          }
        }
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    onImagesChange?.(updatedImages);
    // 同步移除file_id
    setUploadedFileIds((prev) => prev.filter((_, i) => i !== index));
    setAgentConfigs((prev) => {
      const newCfg = { ...prev };
      if (newCfg.vision_node && newCfg.vision_node.image_file_id === uploadedFileIds[index]) {
        delete newCfg.vision_node.image_file_id;
      }
      return newCfg;
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 拼接 vision_node 展示字符串
  const buildVisionNodeContent = (cfg: any) => {
    const lines: string[] = [];
    // 图片ID转为图片链接并插入img标签
    if (cfg.image_file && cfg.image_file.length > 0) {
      const imgs = cfg.image_file.map((fid: string) => `<img src="/api/file/${fid}" alt="图片" style="max-width:180px;max-height:180px;border-radius:6px;margin:4px 0;" />`).join('');
      lines.push(`🖼️ 图片：\n${imgs}`);
    }
    if (cfg.image_url) {
      lines.push(`🖼️ 图片：\n<img src="${cfg.image_url}" alt="图片链接" style="max-width:180px;max-height:180px;border-radius:6px;margin:4px 0;" />`);
    }
    if (cfg.query_type) lines.push(`🔽 分析类型：${cfg.query_type}`);
    if (cfg.content) lines.push(cfg.content);
    else if (value) lines.push(value);
    return lines.join('\n');
  };

  // 发送消息时拼接智能体参数
  const handleSend = () => {
    // vision_node 特殊处理，content 为整合字符串
    if (selectedAgent === 'vision_node') {
      // 只取当前图片、分析类型、输入内容
      const visionCfg = {
        image_file: uploadedFileIds, // 当前上传的图片ID
        image_url: agentConfigs.vision_node?.image_url,
        query_type: agentConfigs.vision_node?.query_type,
        content: value, // 当前输入框内容
      };
      const newCfg = {
        ...agentConfigs,
        vision_node: visionCfg,
      };
      onSend(newCfg, buildVisionNodeContent(visionCfg));
      // 发送后清空
      setUploadedImages([]);
      setUploadedFileIds([]);
      setAgentConfigs((prev) => ({ ...prev, vision_node: {} }));
      onChange(""); // 清空输入框
    } else {
      // 其它智能体逻辑不变
      let finalContent = value;
      if (selectedAgent && activeSchema && agentConfigs[selectedAgent]) {
        const paramText = (activeSchema.fields || [])
          .filter(f => agentConfigs[selectedAgent][f.name])
          .map(f => `${f.label}: ${agentConfigs[selectedAgent][f.name]}`)
          .join('\n');
        if (paramText) {
          finalContent = value ? value + '\n' + paramText : paramText;
        }
      }
      onSend(agentConfigs, finalContent);
    }
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
        handleSend();
      }
    }
  };

  // 处理智能体选择
  const handleAgentSelect = (agentName: string) => {
    const newAgent = selectedAgent === agentName ? null : agentName;
    setSelectedAgent(newAgent);
    
    if (newAgent) {
      // 如果有其他选项被激活，先关闭它们
      if (options.reasoning) onToggleOption('reasoning');
      if (options.toolCall) onToggleOption('toolCall');
      if (options.imageDescription) onToggleOption('imageDescription');
      if (options.imageClassification) onToggleOption('imageClassification');
      if (options.visualReasoning) onToggleOption('visualReasoning');
      if (options.visualQA) onToggleOption('visualQA');
      if (options.imageSentiment) onToggleOption('imageSentiment');
      
      // 设置当前智能体
      options.entry_action = newAgent;
      
      // 如果是写作节点，设置默认配置
      if (newAgent === 'writing_node') {
        setAgentConfigs((prev) => ({
          ...prev,
          writing_node: {
            content: value,
            tone: "专业权威"
          }
        }));
      }
    } else {
      // 取消选择智能体时，清除 entry_action
      options.entry_action = undefined;
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
              <button 
                className={`deep-think-btn${selectedAgent === schema.name ? " active" : ""}`} 
                onClick={() => handleAgentSelect(schema.name)} 
                type="button"
              >
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
      <button id="sendButton" disabled={disabled || value.trim() === ""} onClick={handleSend} title="发送消息">
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
              agentData={agentConfigs[activeSchema.name] || Object.fromEntries((activeSchema.fields || []).map((f: any) => [f.name, f.default ?? ""]))}
              label={activeSchema.label}
              onSelect={() => setShowAgentCard(false)}
              onConfigChange={(data) => {
                setAgentConfigs((prev) => ({...prev, [activeSchema.name]: data}));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InputContainer;