"use client";

import React, { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PixelOffice } from "./PixelOffice";

if (typeof window !== "undefined") {
  const originalError = window.onerror;
  window.onerror = function (msg, url, line, col, error) {
    if (typeof msg === "string" && (msg.includes("ResizeObserver loop limit exceeded") || msg.includes("ResizeObserver loop completed with undelivered notifications"))) {
      return true;
    }
    if (originalError) return originalError(msg, url, line, col, error);
    return false;
  };
}

export default function VirtualOfficeLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleAgentClick = (agentId: number) => {
    switch (agentId) {
      case 1:
        router.push("/trend-planner");
        break;
      case 2:
        router.push("/");
        break;
      case 3:
        router.push("/content-creator");
        break;
      case 4:
        router.push("/guide");
        break;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-950 overflow-hidden">
      {/* Left Panel - The Virtual Office (Hidden on very small screens, visible on md+) */}
      <div className="hidden lg:block lg:w-[60%] h-full min-h-0 relative border-r border-gray-800 shadow-2xl z-10">
        <PixelOffice onAgentClick={handleAgentClick} />
        
        {/* Branding Overlay */}
        <div className="absolute top-6 left-6 z-20">
          <h1 className="text-xl font-bold text-white tracking-widest drop-shadow-md">
            ADVICE <span className="text-blue-500">CONTENT HUB</span>
          </h1>
          <p className="text-gray-400 text-xs">Virtual Office 1.0</p>
        </div>
      </div>

      {/* Right Panel - The Terminal / Workspace */}
      <div className="w-full lg:w-[40%] h-full bg-[#050505] border-l border-[#292524] overflow-y-auto custom-scrollbar relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.9)]">
        {/* The children is the standard Next.js page content */}
        <div className="min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
