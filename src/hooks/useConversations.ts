import { useCallback, useEffect, useState } from 'react';

export type Conversation = { id: string };

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // 获取会话列表
  const fetchList = useCallback(async () => {
    const res = await fetch('/api/conversations');
    const list = await res.json();
    setConversations(list);
    if (list.length === 0) {
      setCurrentId(null);
      localStorage.removeItem('agnflow_conversation_id');
      return null;
    } else {
      const localId = localStorage.getItem('agnflow_conversation_id');
      const found = list.find((c: any) => c.id === localId);
      if (localId && found) {
        setCurrentId(localId);
        return localId;
      } else {
        const last = list[list.length - 1];
        setCurrentId(last.id);
        localStorage.setItem("agnflow_conversation_id", last.id);
        return last.id;
      }
    }
  }, []);

  // 新建会话
  const createConversation = useCallback(async () => {
    const res = await fetch('/api/conversation', { method: 'POST' });
    const data = await res.json();
    await fetchList();
    setCurrentId(data.id);
    localStorage.setItem('agnflow_conversation_id', data.id);
    return data.id;
  }, [fetchList]);

  // 删除会话
  const deleteConversation = useCallback(async (id: string) => {
    await fetch(`/api/conversation/${id}`, { method: 'DELETE' });
    if (id === currentId) {
      localStorage.removeItem('agnflow_conversation_id');
      setCurrentId(null);
    }
    await fetchList();
    // 如果没有会话了，自动新建一个
    setTimeout(async () => {
      if (conversations.length === 1) {
        await createConversation();
      }
    }, 0);
  }, [currentId, fetchList, conversations.length, createConversation]);

  // 切换会话
  const switchConversation = useCallback((id: string) => {
    setCurrentId(id);
    localStorage.setItem('agnflow_conversation_id', id);
  }, []);

  // 初始化
  useEffect(() => {
    (async () => {
      const id = await fetchList();
      if (id) setCurrentId(id);
    })();
  }, [fetchList]);

  return {
    conversations,
    currentId,
    createConversation,
    deleteConversation,
    switchConversation,
    fetchList,
    setCurrentId,
  };
} 