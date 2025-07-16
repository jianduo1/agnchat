export interface AgentData {
  name: string;
  type: 'chat' | 'task' | 'assistant';
  capabilities: string[];
  model: string;
  description: string;
  config: string;
  tags: Array<{
    id: string;
    text: string;
  }>;
  link: string;
  files: File[];
}
