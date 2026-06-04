"use client";

import React, { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import OfficeGrid from "./OfficeGrid";

export default function VirtualOfficeLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active desk based on current route
  let activeDesk = "stock";
  if (pathname.includes("/trend-planner")) activeDesk = "trend";
  if (pathname.includes("/content-creator")) activeDesk = "creative";
  if (pathname.includes("/promotion-combo") || pathname.includes("/guide")) activeDesk = "editor";

  const handleSelectDesk = (id: string) => {
    switch (id) {
      case "trend":
        router.push("/trend-planner");
        break;
      case "stock":
        router.push("/");
        break;
      case "creative":
        router.push("/content-creator");
        break;
      case "editor":
        router.push("/guide"); // Or promotion combo
        break;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-950 overflow-hidden">
      {/* Left Panel - The Virtual Office (Hidden on very small screens, visible on md+) */}
      <div className="hidden lg:block lg:w-[60%] h-full relative border-r border-gray-800 shadow-2xl z-10">
        <OfficeGrid activeDesk={activeDesk} onSelectDesk={handleSelectDesk} />
        
        {/* Branding Overlay */}
        <div className="absolute top-6 left-6 z-20">
          <h1 className="text-xl font-bold text-white tracking-widest drop-shadow-md">
            ADVICE <span className="text-blue-500">CONTENT HUB</span>
          </h1>
          <p className="text-gray-400 text-xs">Virtual Office 1.0</p>
        </div>
      </div>

      {/* Right Panel - The Terminal / Workspace */}
      <div className="w-full lg:w-[40%] h-full bg-[#1e1e1e] overflow-y-auto custom-scrollbar relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        {/* The children is the standard Next.js page content */}
        <div className="min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
