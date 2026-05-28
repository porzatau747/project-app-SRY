import React from "react";

export function StatusBox({ action }: { action: { loading: boolean; message: string; error: string } }) {
  return (
    <div className="statusBox">
      <p>สถานะ</p>
      <strong>{action.loading ? action.message : action.error || action.message || "พร้อมใช้งาน"}</strong>
      {action.error ? <span>{action.error}</span> : null}
    </div>
  );
}
