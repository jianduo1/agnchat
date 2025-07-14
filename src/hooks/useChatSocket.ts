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
        setMessages((msgs) => [...msgs, data]);
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
  const sendMessage = useCallback((content: string, options: ChatOptions) => {
    if (!wsRef.current || wsRef.current.readyState !== 1) return;
    wsRef.current.send(JSON.stringify({type: "message", content, options}));
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
