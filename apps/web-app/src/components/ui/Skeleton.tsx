import React from "react";

export function Skeleton({ className = "", style = {} }: { className?: string, style?: React.CSSProperties }) {
  return (
    <div
      className={`skeleton-loader ${className}`}
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderRadius: "4px",
        position: "relative",
        overflow: "hidden",
        ...style
      }}
    >
      <div
        className="skeleton-wave"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)",
          transform: "translateX(-100%)",
          animation: "skeleton-wave 1.5s infinite"
        }}
      />
    </div>
  );
}

// Add these keyframes to your globals.css
// @keyframes skeleton-wave {
//   100% {
//     transform: translateX(100%);
//   }
// }
