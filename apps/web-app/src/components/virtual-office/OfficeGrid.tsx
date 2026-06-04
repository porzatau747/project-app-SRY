"use client";

import Image from "next/image";
import DeskComponent from "./DeskComponent";

interface OfficeGridProps {
  activeDesk: string | null;
  onSelectDesk: (deskId: string) => void;
}

export default function OfficeGrid({ activeDesk, onSelectDesk }: OfficeGridProps) {
  const desks = [
    {
      id: "trend",
      name: "Trend Analyst",
      imageSrc: "/images/virtual-office/desk_trend_1780560087450.png",
      col: "col-start-1 col-span-2",
      row: "row-start-1 row-span-2",
    },
    {
      id: "stock",
      name: "Promo & Stock",
      imageSrc: "/images/virtual-office/desk_stock_1780560098277.png",
      col: "col-start-3 col-span-2",
      row: "row-start-2 row-span-2",
    },
    {
      id: "creative",
      name: "Creative Content",
      imageSrc: "/images/virtual-office/desk_creative_1780560111504.png",
      col: "col-start-1 col-span-2",
      row: "row-start-3 row-span-2",
    },
    {
      id: "editor",
      name: "Editor in Chief",
      imageSrc: "/images/virtual-office/desk_editor_1780560126121.png",
      col: "col-start-3 col-span-2",
      row: "row-start-4 row-span-2",
    },
  ];

  return (
    <div className="relative w-full h-full min-h-screen bg-gray-900 flex items-center justify-center p-8 overflow-hidden">
      {/* Background Floor */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/virtual-office/office_floor_1780560072626.png"
          alt="Office Floor"
          fill
          className="object-cover opacity-60"
          priority
        />
        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-gray-900/60 to-gray-900"></div>
      </div>

      {/* Grid Container */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-4 grid-rows-6 gap-6 md:gap-12 perspective-[1000px]">
        {desks.map((desk) => (
          <div key={desk.id} className={`${desk.col} ${desk.row} transform rotate-x-12 rotate-z-0`}>
             <DeskComponent
                id={desk.id}
                name={desk.name}
                imageSrc={desk.imageSrc}
                isActive={activeDesk === desk.id}
                onClick={onSelectDesk}
             />
          </div>
        ))}
      </div>
    </div>
  );
}
