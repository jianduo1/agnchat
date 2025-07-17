import React, {useState, useRef} from "react";
import type {AgentData} from "../types/agent";
import "../styles/AgentCard.css";

interface FormField {
  name: string;
  type: string; // 'radio' | 'checkbox' | 'input' | 'number' | 'textarea' | 'json' | 'select';
  options?: string[];
  example?: string | string[];
  default?: string;
  required?: boolean;
  placeholder?: string;
  label?: string; 
}

interface AgentCardProps {
  formFields: FormField[];
  agentData: AgentData;
  label?: string;
  isSelected?: boolean;
  editing?: boolean;
  onSelect?: (agentData: AgentData) => void;
  onConfigChange?: (agentData: AgentData) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({formFields, agentData: initialAgentData, label, isSelected = false, onConfigChange}) => {
  const [agentData, setAgentData] = useState<AgentData>(initialAgentData);
  const configRef = useRef<HTMLTextAreaElement>(null);
  const [wraplineFields, setMultilineFields] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: keyof AgentData, value: unknown) => {
    const newData = {...agentData, [field]: value};
    setAgentData(newData);
    onConfigChange?.(newData);
  };

  const formatJSON = () => {
    try {
      if (configRef.current) {
        const jsonValue = JSON.parse(configRef.current.value);
        configRef.current.value = JSON.stringify(jsonValue, null, 2);
        handleInputChange("config", configRef.current.value);
      }
    } catch {
      console.error("Invalid JSON");
    }
  };

  // 批量填充所有示例
  const handleFillAllExamples = () => {
    const newData = {...agentData};
    formFields.forEach((field) => {
      if (field.example !== undefined) {
        let value: any = field.example;
        if (field.type === "checkbox" || field.type === "file") {
          value = Array.isArray(field.example) ? field.example : typeof field.example === "string" && field.example.includes(",") ? field.example.split(",").map((v) => v.trim()) : [field.example];
        }
        (newData as any)[field.name] = value;
      }
    });
    setAgentData(newData);
    onConfigChange?.(newData);
  };

  const renderField = (field: FormField) => {
    const fieldLabel = field.label || field.name;  // 优先使用label
    
    switch (field.type) {
      case "radio":
        return (
          <div className="field radio-group">
            <label>🔘 {fieldLabel}</label>
            {field.options?.map((option) => (
              <label key={option}>
                <input type="radio" name={field.name} value={option} checked={agentData[field.name as keyof AgentData] === option} onChange={(e) => handleInputChange(field.name as keyof AgentData, e.target.value)} />
                {option}
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="field checkbox-group">
            <label>☑️ {fieldLabel}</label>
            {field.options?.map((option) => {
              const arr = Array.isArray(agentData[field.name as keyof AgentData]) ? (agentData[field.name as keyof AgentData] as string[]) : [];
              return (
                <label key={option}>
                  <input
                    type="checkbox"
                    name={field.name}
                    value={option}
                    checked={arr.includes(option)}
                    onChange={(e) => {
                      let newArr = arr.slice();
                      if (e.target.checked) {
                        newArr.push(option);
                      } else {
                        newArr = newArr.filter((v) => v !== option);
                      }
                      handleInputChange(field.name as keyof AgentData, newArr);
                    }}
                  />
                  {option}
                </label>
              );
            })}
          </div>
        );
      case "select":
        return (
          <div className="field select-field">
            <label>🔽 {fieldLabel}</label>
            <select value={(agentData[field.name as keyof AgentData] as string) || ""} onChange={(e) => handleInputChange(field.name as keyof AgentData, e.target.value)} required={field.required}>
              <option value="" disabled>
                {field.placeholder || `请选择${fieldLabel}`}
              </option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      case "number":
        return (
          <div className="field">
            <label>🔢 {fieldLabel}</label>
            <input type="number" value={(agentData[field.name as keyof AgentData] as string) || ""} onChange={(e) => handleInputChange(field.name as keyof AgentData, e.target.value)} placeholder={field.placeholder || `请输入${fieldLabel}`} required={field.required} />
          </div>
        );
      case "textarea": {
        const isWrapline = wraplineFields[field.name] ?? true;
        return (
          <div className="field textarea-field">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
              <label>📝 {fieldLabel}</label>
              <div className="field-actions">
                <button
                  type="button"
                  onClick={() =>
                    setMultilineFields((prev) => ({
                      ...prev,
                      [field.name]: !isWrapline,
                    }))
                  }
                >
                  换行
                </button>
              </div>
            </div>
            <textarea
              value={(agentData[field.name as keyof AgentData] as string) || ""}
              onChange={(e) => handleInputChange(field.name as keyof AgentData, e.target.value)}
              placeholder={field.placeholder || `请输入${fieldLabel}`}
              required={field.required}
              wrap={isWrapline ? "soft" : "off"}
              style={{
                whiteSpace: isWrapline ? "pre-wrap" : "pre",
                overflowX: isWrapline ? "auto" : "scroll",
              }}
            />
          </div>
        );
      }
      case "json":
        return (
          <div className="field json-field">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
              <label>⚙️ {fieldLabel}</label>
              <div className="field-actions">
                <button type="button" onClick={formatJSON}>
                  格式化
                </button>
              </div>
            </div>
            <textarea ref={configRef} value={(agentData[field.name as keyof AgentData] as string) || ""} onChange={(e) => handleInputChange(field.name as keyof AgentData, e.target.value)} placeholder={field.placeholder || `请输入${fieldLabel}`} required={field.required} />
          </div>
        );
      case "file": {
        // 处理文件上传和预览
        const filesRaw = agentData[field.name as keyof AgentData];
        const files = Array.isArray(filesRaw) ? filesRaw : filesRaw ? [filesRaw] : [];
        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const fileList = e.target.files ? Array.from(e.target.files) : [];
          const newFiles: any[] = [...files];
          for (const file of fileList) {
            // 上传到后端
            const formData = new FormData();
            formData.append('file', file);
            try {
              const res = await fetch('/api/upload', { method: 'POST', body: formData });
              const data = await res.json();
              if (data.file_id) {
                newFiles.push(data.file_id); // 只保存file_id
              }
            } catch {
              alert('文件上传失败');
            }
          }
          handleInputChange(field.name as keyof AgentData, newFiles);
        };
        const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          const fileList = Array.from(e.dataTransfer.files);
          handleInputChange(field.name as keyof AgentData, [...files, ...fileList]);
        };
        const handleRemove = (idx: number) => {
          const newFiles = files.filter((_, i) => i !== idx);
          handleInputChange(field.name as keyof AgentData, newFiles);
        };
        return (
          <div className="field file-upload-field">
            <label>📄 {fieldLabel}</label>
            <div className="file-upload-area" tabIndex={0} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
              <input type="file" multiple style={{display: "none"}} id={`file-input-${field.name}`} onChange={handleFileChange} />
              <label htmlFor={`file-input-${field.name}`} className="file-upload-btn">
                点击或拖拽上传文件
              </label>
            </div>
            {files.length > 0 && (
              <div className="file-preview-list">
                {files.map((file, idx) => {
                  let preview;
                  let key;
                  if (typeof file === "string") {
                    // 判断是否为图片（简单通过后缀名或file_id约定）
                    if (file.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/i) || file.startsWith('http') || file.startsWith('/api/upload/')) {
                      // 统一用相对前端根目录的路径
                      let imgSrc;
                      if (file.startsWith('http')) {
                        imgSrc = file;
                      } else if (file.startsWith('/')) {
                        imgSrc = file; // 已经是绝对路径
                      } else {
                        imgSrc = `${window.location.origin}/api/file/${file}`;
                      }
                      preview = <img src={imgSrc} alt="预览" className="file-preview-image" style={{maxWidth: '120px', maxHeight: '120px', borderRadius: '6px', border: '1px solid #333', background: '#222'}} />;
                    } else {
                      preview = <span className="file-preview-link">{file}</span>;
                    }
                    key = String(file) + idx;
                  }
                  return (
                    <div className="file-preview-item" key={key}>
                      {preview}
                      <button className="file-remove-btn" type="button" onClick={() => handleRemove(idx)} title="删除">
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }
      case "input":
      default:
        return (
          <div className="field">
            <label>🔤 {fieldLabel}</label>
            <input type="text" value={(agentData[field.name as keyof AgentData] as string) || ""} onChange={(e) => handleInputChange(field.name as keyof AgentData, e.target.value)} placeholder={field.placeholder || `请输入${fieldLabel}`} required={field.required} />
          </div>
        );
    }
  };

  // if (!agentData.name) {
  //   return null;
  // }

  return (
    <div className={`agent-card ${isSelected ? "selected" : ""}`}>
      <div className="card-header">
        <h3>{label}</h3>
        <button className="example-btn" onClick={handleFillAllExamples}>
          示例
        </button>
      </div>
      <div className="card-content">
        {formFields.map((field) => (
          <div key={field.name} className="form-field">
            {renderField(field)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentCard;
