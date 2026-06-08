import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { StockDashboard } from "./StockDashboard";
import { InventoryItem } from "../../types/planner";

const mockInventory: InventoryItem[] = [
  { 
    code: "A1", 
    product: "Item 1 (ทั่วไป)", 
    itemType: "KEYBOARD", 
    cost: 100, 
    sellPrice: 200, 
    qty: 5, 
    stockValue: 500, 
    projectedRevenue: 1000, 
    margin: 500, 
    agingDays: 10, 
    agingBucket: "<90 days", 
    store: "001", 
    serial: "" 
  },
  { 
    code: "A2", 
    product: "Notebook A", 
    itemType: "Notebook", 
    cost: 1000, 
    sellPrice: 1500, 
    qty: 2, 
    stockValue: 2000, 
    projectedRevenue: 3000, 
    margin: 1000, 
    agingDays: 45, 
    agingBucket: "<90 days", 
    store: "001", 
    serial: "" 
  },
  { 
    code: "A3", 
    product: "Printer B", 
    itemType: "PRINTER", 
    cost: 500, 
    sellPrice: 600, 
    qty: 10, 
    stockValue: 5000, 
    projectedRevenue: 6000, 
    margin: 1000, 
    agingDays: 100, 
    agingBucket: "90-119 days", 
    store: "001", 
    serial: "" 
  }
];

describe("StockDashboard", () => {
  it("ควรคำนวณและเรนเดอร์ตัวชี้วัดทางการเงินถูกต้อง", () => {
    // ใช้ React.createElement แทน <StockDashboard inventory={mockInventory} />
    const { getByText } = render(React.createElement(StockDashboard, { inventory: mockInventory }));
    // ทุนรวม = 5*100 + 2*1000 + 10*500 = 7500
    // คาดการณ์รายได้ = 1000 + 3000 + 6000 = 10000
    // กำไร = 10000 - 7500 = 2500
    // อัตรากำไร = 25% (25.0%)
    
    expect(getByText(/7,500/)).toBeDefined();
    expect(getByText(/10,000/)).toBeDefined();
    expect(getByText(/2,500/)).toBeDefined();
    expect(getByText(/25\.0%/)).toBeDefined();
  });

  it("ควรคัดแยก เมาส์และคีย์บอร์ด (ทั่วไป) ออกจากหมวดหมู่อื่นๆ", () => {
    const { getByText } = render(React.createElement(StockDashboard, { inventory: mockInventory }));
    expect(getByText(/เมาส์และคีย์บอร์ด \(ทั่วไป\)/)).toBeDefined();
  });
});
