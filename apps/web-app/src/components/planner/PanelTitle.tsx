import React from "react";

export function PanelTitle({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="panelTitle">
      <p>{step}</p>
      <h2>{title}</h2>
      <span>{description}</span>
    </div>
  );
}
