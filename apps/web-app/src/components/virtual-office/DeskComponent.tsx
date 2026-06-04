"use client";

import Image from "next/image";

interface DeskComponentProps {
  id: string;
  name: string;
  imageSrc: string;
  isActive: boolean;
  onClick: (id: string) => void;
}

export default function DeskComponent({ id, name, imageSrc, isActive, onClick }: DeskComponentProps) {
  return (
    <div
      onClick={() => onClick(id)}
      className={`relative cursor-pointer transition-all duration-300 transform ${
        isActive ? "scale-105 z-20" : "hover:scale-105 hover:z-10 z-0"
      }`}
    >
      {/* Glow Effect when active */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
          isActive ? "opacity-40 blur-xl bg-blue-500" : "opacity-0"
        }`}
      />
      
      {/* Desk Image */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-2xl border-2 transition-colors duration-300 ${isActive ? 'border-blue-400' : 'border-transparent'}">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Nameplate */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900/90 border border-gray-700 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap shadow-lg backdrop-blur-sm z-30 transition-transform duration-300">
        <span className={isActive ? "text-blue-400 font-bold" : "text-gray-300"}>{name}</span>
      </div>
    </div>
  );
}
