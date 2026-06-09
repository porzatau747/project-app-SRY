'use client';

import React, { useEffect, useRef, useState } from 'react';
import { OfficeCanvas } from '../../pixel-engine/office/components/OfficeCanvas';
import { OfficeState } from '../../pixel-engine/office/engine/officeState';
import { EditorState } from '../../pixel-engine/office/editor/editorState';
import { createDefaultLayout } from '../../pixel-engine/office/layout/layoutSerializer';

interface PixelOfficeProps {
  onAgentClick: (agentId: number) => void;
}

export function PixelOffice({ onAgentClick }: PixelOfficeProps) {
  const [officeState] = useState(() => {
    const layout = createDefaultLayout();
    
    // We can customize the layout here if we want to add more desks, 
    // but the default layout from pixel-agents already has desks!
    
    const state = new OfficeState(layout);
    
    // Add 4 static agents
    state.addAgent(1, 0, 0, undefined, true, "Trend Analyst");
    state.addAgent(2, 1, 0, undefined, true, "Promo & Stock");
    state.addAgent(3, 2, 0, undefined, true, "Creative");
    state.addAgent(4, 3, 0, undefined, true, "Editor");
    
    // Set them to type at their desks
    state.setAgentActive(1, true);
    state.setAgentActive(2, false);
    state.setAgentActive(3, false);
    state.setAgentActive(4, true);

    return state;
  });

  const [editorState] = useState(() => new EditorState());
  const panRef = useRef({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(2);

  // We are not using edit mode for the user, just view mode
  const isEditMode = false;

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#111827]">
      <OfficeCanvas
        officeState={officeState}
        onClick={onAgentClick}
        isEditMode={isEditMode}
        editorState={editorState}
        onEditorTileAction={() => {}}
        onEditorEraseAction={() => {}}
        onEditorSelectionChange={() => {}}
        onDeleteSelected={() => {}}
        onRotateSelected={() => {}}
        onDragMove={() => {}}
        editorTick={0}
        zoom={zoom}
        onZoomChange={setZoom}
        panRef={panRef}
      />
    </div>
  );
}
