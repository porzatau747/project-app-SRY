import { describe, it, expect, beforeEach } from "vitest";
import { getHistory, saveToHistory, deleteFromHistory, togglePinHistory } from "./historyUtils";

describe("historyUtils", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("ควรบันทึกประวัติใหม่และดึงกลับมาได้", () => {
    const item = saveToHistory({
      pageType: "stock",
      title: "ทดสอบคอมโบ",
      result: "ผลลัพธ์จาก AI",
      inputState: { test: true }
    });

    const history = getHistory();
    expect(history.length).toBe(1);
    expect(history[0].title).toBe("ทดสอบคอมโบ");
    expect(history[0].isPinned).toBe(false);
  });

  it("สามารถลบรายการประวัติได้", () => {
    const item = saveToHistory({
      pageType: "stock",
      title: "ทดสอบลบ",
      result: "ผลลัพธ์ลบ",
      inputState: null
    });

    const afterDelete = deleteFromHistory(item.id);
    expect(afterDelete.length).toBe(0);
  });

  it("สามารถสลับสถานะการปักหมุดตรึงได้", () => {
    const item = saveToHistory({
      pageType: "stock",
      title: "ทดสอบปักหมุด",
      result: "ผลลัพธ์ปักหมุด",
      inputState: null
    });

    const pinned = togglePinHistory(item.id);
    expect(pinned[0].isPinned).toBe(true);
  });

  it("ไม่ควรบันทึกผลลัพธ์ที่ซ้ำซ้อนกันในประวัติ", () => {
    const data = {
      pageType: "creator" as const,
      title: "ชื่อซ้ำ",
      result: "เนื้อความซ้ำ",
      inputState: null
    };

    saveToHistory(data);
    saveToHistory(data);

    const history = getHistory();
    expect(history.length).toBe(1);
  });
});
