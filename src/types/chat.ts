// 聊天选项类型定义
export type ChatOptions = {
  entry_action?: string;  // 当前选中的智能体
  reasoning: boolean;
  toolCall: boolean;
  imageDescription?: boolean;
  imageClassification?: boolean;
  visualReasoning?: boolean;
  visualQA?: boolean;
  imageSentiment?: boolean;
}; 