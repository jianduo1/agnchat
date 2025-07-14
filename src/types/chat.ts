// 聊天选项类型定义
export type ChatOptions = {
  reasoning: boolean;
  toolCall: boolean;
  imageDescription?: boolean;
  imageClassification?: boolean;
  visualReasoning?: boolean;
  visualQA?: boolean;
  imageSentiment?: boolean;
}; 