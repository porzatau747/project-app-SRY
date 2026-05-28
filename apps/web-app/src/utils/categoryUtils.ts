export type MacroCategory =
  | "Notebook & PC"
  | "Component"
  | "Monitor & Display"
  | "Gaming & Stream"
  | "Network & CCTV"
  | "Printer & Ink"
  | "Accessories"
  | "Clearance"
  | "Services & Others"
  | "อื่นๆ";

export const MACRO_CATEGORIES: MacroCategory[] = [
  "Notebook & PC",
  "Component",
  "Monitor & Display",
  "Gaming & Stream",
  "Network & CCTV",
  "Printer & Ink",
  "Accessories",
  "Clearance",
  "Services & Others",
  "อื่นๆ"
];

export function getMacroCategory(rawType: string | undefined | null): MacroCategory {
  if (!rawType) return "อื่นๆ";
  
  const typeLower = rawType.toLowerCase().trim();

  if (typeLower.includes("clearance")) return "Clearance";
  
  if (
    typeLower.includes("notebook") || 
    typeLower.includes("comset") || 
    typeLower.includes("bundle")
  ) {
    if (!typeLower.includes("acces") && !typeLower.includes("อะไหล่")) {
      return "Notebook & PC";
    }
  }

  if (
    typeLower === "cpu" || 
    typeLower === "mainboard" || 
    typeLower === "ram" || 
    typeLower === "vga card" || 
    typeLower === "ssd" || 
    typeLower === "harddisk" || 
    typeLower === "power supply" || 
    typeLower === "case" || 
    typeLower === "sound card" || 
    typeLower === "fan"
  ) {
    return "Component";
  }

  if (typeLower.includes("monitor") || typeLower.includes("projector")) {
    return "Monitor & Display";
  }

  if (typeLower.includes("gaming") || typeLower.includes("streamer")) {
    return "Gaming & Stream";
  }

  if (
    typeLower.includes("cctv") || 
    typeLower.includes("camera") || 
    typeLower.includes("lan") || 
    typeLower.includes("network") ||
    typeLower.includes("wireless")
  ) {
    return "Network & CCTV";
  }

  if (
    typeLower.includes("printer") || 
    typeLower.includes("หมึก") || 
    typeLower.includes("toner") || 
    typeLower.includes("paper")
  ) {
    return "Printer & Ink";
  }

  if (
    typeLower.includes("mouse") || 
    typeLower.includes("keyboard") || 
    typeLower.includes("headphone") || 
    typeLower.includes("mic") || 
    typeLower.includes("speaker") || 
    typeLower.includes("usb") || 
    typeLower.includes("memory") || 
    typeLower.includes("power bank") || 
    typeLower.includes("charger") || 
    typeLower.includes("cable") || 
    typeLower.includes("hub") || 
    typeLower.includes("enclosure") || 
    typeLower.includes("ups") || 
    typeLower.includes("accessories") || 
    typeLower.includes("cd-rom") || 
    typeLower.includes("cd ") || 
    typeLower.includes("controller") || 
    typeLower.includes("gadget") || 
    typeLower.includes("smart home") || 
    typeLower.includes("barcode")
  ) {
    return "Accessories";
  }

  if (
    typeLower.includes("software") || 
    typeLower.includes("premium") || 
    typeLower.includes("บริการ") || 
    typeLower.includes("อะไหล่") || 
    typeLower.includes("advice only")
  ) {
    return "Services & Others";
  }

  return "อื่นๆ";
}

export function calculateMarkedUpPrice(rawPrice: number | null | undefined, itemType: string): number | null {
  if (rawPrice === null || rawPrice === undefined || rawPrice <= 0) return null;
  
  const typeLower = itemType.toLowerCase().trim();
  const macroCategory = getMacroCategory(itemType);

  let finalPrice = rawPrice;

  // 1. Notebook override: +2000 THB
  if (macroCategory === "Notebook & PC" && typeLower.includes("notebook") && !typeLower.includes("acces") && !typeLower.includes("อะไหล่")) {
    finalPrice = rawPrice + 2000;
  }
  // 2. Printer or Monitor override: +300 THB
  else if (macroCategory === "Monitor & Display" || macroCategory === "Printer & Ink") {
    if (typeLower.includes("monitor") || typeLower.includes("printer")) {
      finalPrice = rawPrice + 300;
    }
  }
  // 3. Base Tiers
  else if (rawPrice < 500) {
    finalPrice = rawPrice * 1.30;
  } else if (rawPrice <= 1000) {
    finalPrice = rawPrice * 1.15;
  } else {
    finalPrice = rawPrice * 1.10;
  }

  // Round to nearest 10 (ปัดเศษหลักหน่วยให้เป็น 0)
  return Math.round(finalPrice / 10) * 10;
}

