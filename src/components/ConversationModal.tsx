import React from "react";

export type Conversation = {id: string};

const ConversationModal: React.FC<{
  open: boolean;
  conversations: Conversation[];
  currentId: string | null;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}> = ({open, conversations, currentId, onSwitch, onDelete, onClose}) => {
  if (!open) return null;
  return (
    <div style={{position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", zIndex: 1000}}>
      <div id="convListPanel">
        <h3 style={{color: "var(--main-color)", marginBottom: 12}}>会话列表</h3>
        {conversations.length === 0 && <div style={{color: "#fff"}}>暂无会话</div>}
        <ul className="scrollbar-thin" style={{listStyle: "none", padding: 0, margin: 0, maxHeight: 300, overflow: "auto"}}>
          {conversations.map((conv) => (
            <li key={conv.id} style={{marginBottom: 10, display: "flex", alignItems: "center"}}>
              <button style={{flex: 1, textAlign: "left", background: conv.id === currentId ? "var(--main-color)" : "#101c2c", color: conv.id === currentId ? "#232526" : "var(--main-color)", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 600}} onClick={() => onSwitch(conv.id)}>
                {conv.id.slice(0, 8)}...{conv.id.slice(-4)}
              </button>
              <button style={{marginLeft: 8, background: "#ff3b3b", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 6, cursor: "pointer"}} onClick={() => onDelete(conv.id)}>
                删除
              </button>
            </li>
          ))}
        </ul>
        <div style={{textAlign: "right", marginTop: 10}}>
          <button id="closeConvList" style={{background: "#232526", color: "var(--main-color)", border: "1.5px solid var(--main-color)", borderRadius: 8, padding: "6px 18px", cursor: "pointer"}} onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationModal;
