import { create } from "zustand";

interface UIState {
  activeTrendTab: "news" | "tips";
  setActiveTrendTab: (tab: "news" | "tips") => void;
  
  aiTemplate: string;
  setAITemplate: (template: string) => void;
  
  aiPrompt: string;
  setAIPrompt: (prompt: string) => void;
  
  aiFreeGift: string;
  setAIFreeGift: (gift: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTrendTab: "news",
  setActiveTrendTab: (tab) => set({ activeTrendTab: tab }),
  
  aiTemplate: "product-a-notebook",
  setAITemplate: (template) => set({ aiTemplate: template }),
  
  aiPrompt: "",
  setAIPrompt: (prompt) => set({ aiPrompt: prompt }),
  
  aiFreeGift: "",
  setAIFreeGift: (gift) => set({ aiFreeGift: gift }),
}));
