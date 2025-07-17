import {useEffect, useRef, useState, useCallback} from "react";
import type {ChatOptions} from "../types/chat";

export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp?: string;
};

export type WSStatus = "connecting" | "connected" | "disconnected" | "streaming";

export function useChatSocket(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<WSStatus>("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingAiMessage, setStreamingAiMessage] = useState<ChatMessage | null>(null);
  const aiMsgIdRef = useRef<string | null>(null);

  //
  useEffect(() => {
    if (!conversationId) return;
    setStatus("connecting");
    setMessages([]);
    setStreamingAiMessage(null);
    const ws = new WebSocket((window.location.protocol === "https:" ? "wss://" : "ws://") + window.location.host + "/ws");
    wsRef.current = ws;
    ws.onopen = () => {
      setStatus("connected");
      ws.send(JSON.stringify({conversation: conversationId}));
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "history") {
        // 修正：role assistant -> ai
        const mappedRole = data.role === 'assistant' ? 'ai' : 'user';
        setMessages((msgs) => [...msgs, {...data, role: mappedRole}]);
      } else if (data.type === "start") {
        setIsStreaming(true);
        setStatus("streaming");
        aiMsgIdRef.current = data.id || Math.random().toString(36).slice(2);
        setStreamingAiMessage({id: aiMsgIdRef.current || Math.random().toString(36).slice(2), role: "ai", content: ""});
      } else if (data.type === "chunk") {
        setStreamingAiMessage((msg) => (msg ? {...msg, content: msg.content + data.content} : null));
      } else if (data.type === "end") {
        setIsStreaming(false);
        setStatus("connected");
        aiMsgIdRef.current = null;
      }
    };
    ws.onclose = () => {
      setStatus("disconnected");
    };
    return () => {
      ws.close();
    };
  }, [conversationId]);

  useEffect(() => {
    if (!isStreaming && streamingAiMessage) {
      setMessages((msgs) => [...msgs, {...streamingAiMessage}]);
      setStreamingAiMessage(null);
    }
  }, [isStreaming, streamingAiMessage]);

  // 发送消息
  const sendMessage = useCallback((content: string, options: ChatOptions, agentConfigs?: Record<string, any>, images?: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== 1) return;
    
    console.log("📤 准备发送消息:", {
      content,
      options,
      agentConfigs,
      hasImages: images?.length > 0
    });

    // 构造发送的消息
    const message: any = {
      type: "message", 
      content, 
      options,
      entry_action: options.entry_action,
      agent_config: agentConfigs?.[options.entry_action || ""] || {}
    };

    // 如果是视觉分析节点且有图片，添加图片相关参数
    if (options.entry_action === 'vision_node' && images?.length > 0) {
      console.log("🖼️ 处理视觉分析节点的图片数据");
      message.agent_config = {
        image_path: images[0], // 发送第一张图片的 DataURL
        query_type: options.imageDescription ? "图像描述生成" :
                   options.imageClassification ? "图像分类" :
                   options.visualReasoning ? "视觉推理" :
                   options.visualQA ? "视觉问答" :
                   options.imageSentiment ? "图像情感分析" : "图像描述生成"
      };
      console.log("  - 分析类型:", message.agent_config.query_type);
      console.log("  - 图片数据长度:", images[0].length);
    }

    console.log("📨 发送最终消息:", {
      type: message.type,
      content,
      entry_action: message.entry_action,
      agent_config: {
        ...message.agent_config,
        image_path: message.agent_config.image_path ? `[图片数据长度: ${message.agent_config.image_path.length}]` : undefined,
      },
    });

    wsRef.current.send(JSON.stringify(message));
    setMessages((msgs) => [...msgs, {id: Math.random().toString(36).slice(2), role: "user", content}]);
  }, []);

  // 删除消息
  const deleteMessage = useCallback(async (id: string) => {
    await fetch(`/api/message/${id}`, {method: "DELETE"});
    setMessages((msgs) => msgs.filter((m) => m.id !== id));
  }, []);

  // 清空消息
  const clearMessages = useCallback(() => setMessages([]), []);

  return {
    messages,
    status,
    isStreaming,
    streamingAiMessage,
    sendMessage,
    deleteMessage,
    clearMessages,
  };
}
