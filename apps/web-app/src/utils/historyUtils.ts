import { HistoryItem } from "../types/planner";

const STORAGE_KEY = "weekly_planner_campaign_history";

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveToHistory(item: Omit<HistoryItem, "id" | "timestamp" | "isPinned">): HistoryItem {
  const newItem: HistoryItem = {
    ...item,
    id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    isPinned: false
  };

  const history = getHistory();
  
  // Prevent exact duplicates
  const isDuplicate = history.some(h => h.title === item.title && h.result === item.result);
  if (isDuplicate) return newItem;

  history.unshift(newItem);

  // Keep max 15 items by removing the oldest unpinned item if necessary
  if (history.length > 15) {
    let unpinnedIndex = -1;
    for (let i = history.length - 1; i >= 0; i--) {
      if (!history[i].isPinned) {
        unpinnedIndex = i;
        break;
      }
    }
    if (unpinnedIndex !== -1) {
      history.splice(unpinnedIndex, 1);
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    // Fallback: clear space if quota exceeded
    const onlyPinned = history.filter(h => h.isPinned);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(onlyPinned.slice(0, 10)));
  }

  return newItem;
}

export function deleteFromHistory(id: string): HistoryItem[] {
  const history = getHistory().filter(item => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {}
  return history;
}

export function togglePinHistory(id: string): HistoryItem[] {
  const history = getHistory().map(item => 
    item.id === id ? { ...item, isPinned: !item.isPinned } : item
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {}
  return history;
}
