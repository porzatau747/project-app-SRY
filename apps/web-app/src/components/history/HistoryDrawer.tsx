import React, { useEffect, useState } from "react";
import { getHistory, deleteFromHistory, togglePinHistory } from "../../utils/historyUtils";
import { HistoryItem } from "../../types/planner";
import toast from "react-hot-toast";

export function HistoryDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
    }
  }, [isOpen]);

  const handleDelete = (id: string) => {
    const updated = deleteFromHistory(id);
    setHistory(updated);
    toast.success("ลบประวัติเรียบร้อยแล้ว");
  };

  const handleTogglePin = (id: string) => {
    const updated = togglePinHistory(id);
    setHistory(updated);
  };

  const handleRestore = (item: HistoryItem) => {
    // Dispatch a custom event to notify target page components to restore their states
    const event = new CustomEvent("restore-campaign", { detail: item });
    window.dispatchEvent(event);
    toast.success(`กู้คืนข้อมูลของ "${item.title}" เรียบร้อยแล้ว`);
    onClose();
  };

  const getPageColor = (pageType: string) => {
    switch (pageType) {
      case "stock": return "var(--color-neon-cyan)";
      case "trend": return "#22c55e"; // Green
      case "combo": return "#a855f7"; // Purple
      default: return "var(--color-neon-yellow)";
    }
  };

  const getPageLabel = (pageType: string) => {
    switch (pageType) {
      case "stock": return "สต็อก";
      case "trend": return "เทรนด์";
      case "combo": return "คอมโบ";
      default: return "AI";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 100
        }}
      />

      {/* Sliding Drawer Panel */}
      <div 
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(100%, 380px)",
          background: "rgba(10, 15, 30, 0.95)",
          borderLeft: "2px solid var(--color-glass-border)",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.7), -2px 0 10px rgba(34,211,238,0.2)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 101,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          color: "#fafaf9",
          transition: "transform 0.3s ease"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-glass-border)", paddingBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold", color: "var(--color-neon-cyan)", textShadow: "0 0 10px rgba(34,211,238,0.3)" }}>
            🕒 ประวัติแคมเปญ
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#a8a29e",
              fontSize: "1.5rem",
              cursor: "pointer"
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
          {history.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#64748b" }}>
              ไม่มีประวัติแคมเปญคอนเทนต์
            </div>
          ) : (
            history.map(item => (
              <div 
                key={item.id}
                style={{
                  padding: "12px",
                  background: "rgba(2,4,10,0.6)",
                  border: "1px solid var(--color-glass-border)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span 
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: `rgba(255,255,255,0.05)`,
                      color: getPageColor(item.pageType),
                      border: `1px solid ${getPageColor(item.pageType)}`
                    }}
                  >
                    {getPageLabel(item.pageType)}
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={() => handleTogglePin(item.id)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: item.isPinned ? "var(--color-neon-yellow)" : "#475569", fontSize: "1rem" }}
                      title="ปักหมุดเพื่อไม่ให้ถูกลบอัตโนมัติ"
                    >
                      ★
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-clearance-red)", fontSize: "1rem" }}
                      title="ลบ"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <h4 style={{ margin: 0, fontSize: "0.9rem", color: "#fafaf9" }}>{item.title}</h4>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {item.result}
                </p>

                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button 
                    onClick={() => handleRestore(item)}
                    className="primaryButton"
                    style={{ flex: 1, minHeight: "30px", fontSize: "0.75rem", padding: "4px 8px" }}
                  >
                    🔄 กู้คืนฟอร์ม
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(item.result);
                      toast.success("คัดลอกคอนเทนต์เรียบร้อย!");
                    }}
                    className="secondaryButton"
                    style={{ flex: 1, minHeight: "30px", fontSize: "0.75rem", padding: "4px 8px" }}
                  >
                    📋 คัดลอกด่วน
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
