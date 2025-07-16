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
          value = Array.isArray(field.example)
            ? field.example
            : typeof field.example === "string" && field.example.includes(",")
            ? field.example.split(",").map((v) => v.trim())
            : [field.example];
        }
        (newData as any)[field.name] = value;
      }
    });
    setAgentData(newData);
    onConfigChange?.(newData);
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "radio":
        return (
          <div className="field radio-group">
            <label>🔘 {field.name}</label>
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
            <label>☑️ {field.name}</label>
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
            <label>🔽 {field.name}</label>
            <select value={(agentData[field.name as keyof AgentData] as string) || ""} onChange={(e) => handleInputChange(field.name as keyof AgentData, e.target.value)} required={field.required}>
              <option value="" disabled>
                {field.placeholder || "请选择"}
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
            <label>🔢 {field.name}</label>
            <input type="number" value={(agentData[field.name as keyof AgentData] as string) || ""} onChange={(e) => handleInputChange(field.name as keyof AgentData, e.target.value)} placeholder={field.placeholder} required={field.required} />
          </div>
        );
      case "textarea":
        return (
          <div className="field textarea-field">
            <label>📝 {field.name}</label>
            <textarea value={(agentData[field.name as keyof AgentData] as string) || ""} onChange={(e) => handleInputChange(field.name as keyof AgentData, e.target.value)} placeholder={field.placeholder} required={field.required} />
          </div>
        );
      case "json":
        return (
          <div className="field json-field">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
              <label>⚙️ {field.name}</label>
              <div className="field-actions">
                <button type="button" onClick={formatJSON}>
                  格式化
                </button>
              </div>
            </div>
            <textarea ref={configRef} value={(agentData[field.name as keyof AgentData] as string) || ""} onChange={(e) => handleInputChange(field.name as keyof AgentData, e.target.value)} placeholder={field.placeholder} required={field.required}  />
          </div>
        );
      case "file": {
        // 处理文件上传和预览
        const filesRaw = agentData[field.name as keyof AgentData];
        const files = Array.isArray(filesRaw) ? filesRaw : filesRaw ? [filesRaw] : [];
        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const fileList = e.target.files ? Array.from(e.target.files) : [];
          handleInputChange(field.name as keyof AgentData, [...files, ...fileList]);
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
            <label>📄 {field.name}</label>
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
                  if (file instanceof File) {
                    const url = URL.createObjectURL(file);
                    if (file.type.startsWith("image/")) {
                      preview = <img src={url} alt={file.name} className="file-preview-img" />;
                    } else if (file.type.startsWith("video/")) {
                      preview = <video src={url} controls className="file-preview-video" />;
                    } else if (file.type.startsWith("audio/")) {
                      preview = <audio src={url} controls className="file-preview-audio" />;
                    } else {
                      preview = <a href={url} download={file.name} className="file-preview-link">{file.name}</a>;
                    }
                    key = file.name + idx;
                  } else if (file instanceof Blob) {
                    const url = URL.createObjectURL(file);
                    preview = <a href={url} download={`file-${idx}`} className="file-preview-link">{`文件${idx + 1}`}</a>;
                    key = `blob-${idx}`;
                  } else if (typeof file === "string") {
                    preview = <span className="file-preview-link">{file}</span>;
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
            <label>🔤 {field.name}</label>
            <input type="text" value={(agentData[field.name as keyof AgentData] as string) || ""} onChange={(e) => handleInputChange(field.name as keyof AgentData, e.target.value)} placeholder={field.placeholder} required={field.required} />
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
