import { describe, it, expect } from "vitest";
import { getMacroCategory } from "./categoryUtils";

describe("getMacroCategory", () => {
  it("ควรแยกแยะเมาส์และคีย์บอร์ดธรรมดาเป็นหมวดหมู่ เมาส์และคีย์บอร์ด (ทั่วไป)", () => {
    expect(getMacroCategory("KEYBOARD")).toBe("เมาส์และคีย์บอร์ด (ทั่วไป)");
    expect(getMacroCategory("MOUSE")).toBe("เมาส์และคีย์บอร์ด (ทั่วไป)");
    expect(getMacroCategory("KEYBOARD & MOUSE")).toBe("เมาส์และคีย์บอร์ด (ทั่วไป)");
  });

  it("เมาส์และคีย์บอร์ดสำหรับเกมมิ่งควรเข้ากลุ่ม Gaming & Stream", () => {
    expect(getMacroCategory("Gaming Keyboard")).toBe("Gaming & Stream");
    expect(getMacroCategory("Gaming Mouse")).toBe("Gaming & Stream");
  });

  it("สินค้าหูฟังและอุปกรณ์เสริมอื่นๆ ควรยังอยู่ใน Accessories", () => {
    expect(getMacroCategory("headphone")).toBe("Accessories");
    expect(getMacroCategory("usb")).toBe("Accessories");
  });

  it("ควรแยกแยะแฟลชไดร์ฟและเมมโมรี่การ์ดเป็นหมวดหมู่ แฟลชไดร์ฟและเมมโมรี่การ์ด", () => {
    expect(getMacroCategory("USB Flash Drive")).toBe("แฟลชไดร์ฟและเมมโมรี่การ์ด");
    expect(getMacroCategory("MicroSD Card")).toBe("แฟลชไดร์ฟและเมมโมรี่การ์ด");
    expect(getMacroCategory("Thumb Drive")).toBe("แฟลชไดร์ฟและเมมโมรี่การ์ด");
  });
});
