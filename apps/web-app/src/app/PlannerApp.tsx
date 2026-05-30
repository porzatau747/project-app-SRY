"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PanelTitle } from "../components/planner/PanelTitle";
import { StockTablePanel } from "../components/planner/StockTablePanel";
import { StockContentCreator } from "../components/planner/StockContentCreator";
import { useInventoryQuery } from "../hooks/queries/useInventoryQuery";
import { useUIStore } from "../store/uiStore";
import type { PlannerState } from "../types/planner";
import { calculateAgingDiscount } from "../utils/plannerUtils";

import { useQueryClient } from "@tanstack/react-query";

const numberFormatter = new Intl.NumberFormat("th-TH");
const moneyFormatter = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });

export default function PlannerApp({ initialState }: { initialState: PlannerState }) {
  const queryClient = useQueryClient();
  const { state, syncStockMutation } = useInventoryQuery(initialState);
  const setAIPrompt = useUIStore(s => s.setAIPrompt);
  
  // Local file state
  const [stockFile, setStockFile] = useState<File | null>(null);
  const [priceFile, setPriceFile] = useState<File | null>(null);

  function handleSelectProduct(code: string) {
    const item = state.inventory.find(i => i.code === code);
    if (item) {
      const discountInfo = calculateAgingDiscount(item.sellPrice, item.agingDays);
      if (discountInfo && discountInfo.discount > 0) {
        setAIPrompt(`${item.product} (รหัส: ${item.code}) ราคาปกติ ${numberFormatter.format(discountInfo.originalPrice)} บาท ราคาลดพิเศษ ${numberFormatter.format(discountInfo.specialPrice)} บาท`);
      } else {
        setAIPrompt(`${item.product} (รหัส: ${item.code}) ราคาขาย ${item.sellPrice || item.cost} บาท`);
      }
    } else {
      setAIPrompt(code);
    }
  }

  async function handleSearchPrice(code: string) {
    const toastModule = await import("react-hot-toast");
    const toastId = toastModule.toast.loading("กำลังดึงราคาจาก Advice...");
    try {
      const res = await fetch("/api/scrape-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการดึงราคา");
      
      queryClient.setQueryData(["plannerState"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          inventory: old.inventory.map((item: any) => 
            item.code === code ? { ...item, sellPrice: data.price } : item
          )
        };
      });

      setAIPrompt(`พบราคากลางรหัส ${code} = ${numberFormatter.format(data.price)} บาท`);
      toastModule.toast.success(`ดึงราคาสำเร็จ: ${numberFormatter.format(data.price)} บาท`, { id: toastId });
    } catch (err: any) {
      toastModule.toast.error(err.message, { id: toastId });
    }
  }

  const aiPrompt = useUIStore(s => s.aiPrompt);
  const progress = state.inventory.length > 0 ? (aiPrompt ? 3 : 2) : 1;

  return (
    <main className="appShell">
      <div className="appPage">
        <nav className="topNav" aria-label="เมนูหลัก">
          <Link className="activeNav" href="/">
            แผนจากสต็อก
          </Link>
          <Link href="/trend-planner">แผนจากเทรนด์</Link>
          <Link href="/promotion-combo">Promotion Combo</Link>
          <Link href="/content-creator">สร้างคอนเทนต์ด้วย AI</Link>
          <Link href="/guide">คู่มือการใช้งาน</Link>
        </nav>

        <header className="appHero">
          <div>
            <p className="eyebrow">Weekly Content Planner</p>
            <h1>สร้างตารางโพสต์ 7 วันจากสต็อกจริง พร้อมจับเทรนด์ IT ล่าสุดจากอินเทอร์เน็ตอัตโนมัติ</h1>
            <p className="intro">
              ระบบหน้าแผนจากสต็อกใหม่ นำเสนอการวิเคราะห์สต็อกและเครื่องมือสร้าง Prompt ให้ AI วาดภาพโปรโมทสำหรับสินค้าแต่ละเกรดโดยเฉพาะ
            </p>
          </div>
          <StatusBox action={{ 
            loading: syncStockMutation.isPending, 
            message: syncStockMutation.isPending ? "กำลังทำงาน..." : "พร้อมใช้งาน", 
            error: syncStockMutation.error?.message || "" 
          }} />
        </header>

        <Stepper currentStep={progress} />

        <section className="gridTwo">
          <form className="panel stepPanel" onSubmit={(e) => {
            e.preventDefault();
            syncStockMutation.mutate();
          }}>
            <PanelTitle step="ขั้นตอนที่ 1" title="ดึงข้อมูลสต็อกและราคา" description="ระบบจะดึงข้อมูลสต็อกและราคากลางจากระบบหลังบ้านอัตโนมัติ (ใช้เวลาประมาณ 30-60 วินาที)" />
            <button className="primaryButton" type="submit" disabled={syncStockMutation.isPending}>
              {syncStockMutation.isPending ? "กำลังดึงข้อมูล..." : "ดึงข้อมูลสต็อกและราคากลาง"}
            </button>
            {state?.summary?.generatedAt && (
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#a8a29e', textAlign: 'center' }}>
                อัปเดตล่าสุด: {new Date(state.summary.generatedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })} น.
              </div>
            )}
          </form>

          <div className="panel stepPanel">
            <PanelTitle step="สรุปสต็อก" title="ข้อมูลพร้อมใช้งาน" description="ภาพรวมสต็อกล่าสุดและรายการที่ยังไม่มีราคาขาย" />
            <div className="summaryTiles">
              <Metric label="จำนวน SKU" value={numberFormatter.format(state.summary?.totalSku ?? 0)} />
              <Metric label="จำนวน Serial" value={numberFormatter.format(state.summary?.totalSerialItems ?? 0)} />
              <Metric label="จำนวนชิ้น" value={numberFormatter.format(state.summary?.totalQty ?? 0)} />
              <Metric label="ไม่มีราคา" value={numberFormatter.format(state.summary?.missingPriceCount ?? 0)} />
            </div>
            <div className="moneyLine">
              <span>มูลค่าสต็อก</span>
              <strong>{moneyFormatter.format(state.summary?.totalStockValue ?? 0)}</strong>
            </div>
            <div className="moneyLine">
              <span>รายได้คาดการณ์</span>
              <strong>{moneyFormatter.format(state.summary?.totalProjectedRevenue ?? 0)}</strong>
            </div>
          </div>
        </section>

        <StockTablePanel 
          inventory={state.inventory} 
          onSelectProduct={handleSelectProduct} 
          onSearchPrice={handleSearchPrice} 
          loading={syncStockMutation.isPending} 
        />

        <StockContentCreator />
        
      </div>
    </main>
  );
}

// UI Components
function Stepper({ currentStep }: { currentStep: number }) {
  const steps = ["อัปโหลดสต็อก", "เลือกสินค้า", "สร้าง Prompt", "คัดลอกไปเจนภาพ"];
  return (
    <nav className="stepper" aria-label="ความคืบหน้าการทำงาน">
      {steps.map((step, index) => {
        const active = currentStep >= index + 1;
        return (
          <div className={active ? "step activeStep" : "step"} key={step}>
            <span>{index + 1}</span>
            <p>{step}</p>
          </div>
        );
      })}
    </nav>
  );
}

function StatusBox({ action }: { action: { loading: boolean; message: string; error: string } }) {
  return (
    <div className="statusBox">
      <p>สถานะ</p>
      <strong>{action.loading ? action.message : action.error || action.message || "พร้อมใช้งาน"}</strong>
      {action.error ? <span>{action.error}</span> : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metricTile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
