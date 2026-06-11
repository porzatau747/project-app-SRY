"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type {
  PromotionBatch,
  PromotionCampaignType,
  PromotionCandidate,
  PromotionCandidateReason,
  PromotionCopy,
  PromotionReviewStatus,
  PromotionTemplatePreset
} from "../../types/promotion";

const moneyFormatter = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });

export default function PromotionPlannerApp({ initialCandidates }: { initialCandidates: PromotionCandidate[] }) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set(initialCandidates.slice(0, 12).map((item) => item.productCode)));
  const [savedBatches, setSavedBatches] = useState<PromotionBatch[]>([]);
  const [batch, setBatch] = useState<PromotionBatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [minCost, setMinCost] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [campaignType, setCampaignType] = useState<PromotionCampaignType>("clearance");
  const [templatePreset, setTemplatePreset] = useState<PromotionTemplatePreset>("clearance");

  const selectedCount = selectedCodes.size;
  const approvedCount = useMemo(() => batch?.items.filter((item) => item.reviewStatus === "approved" || item.reviewStatus === "exported").length || 0, [batch]);
  const categoryOptions = useMemo(() => Array.from(new Set(candidates.map((item) => item.itemType || "สินค้า IT"))).sort(), [candidates]);
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const categoryMatched = categoryFilter === "all" || candidate.itemType === categoryFilter;
      const reasonMatched = reasonFilter === "all" || candidate.reasons.includes(reasonFilter as PromotionCandidateReason);
      return categoryMatched && reasonMatched;
    });
  }, [candidates, categoryFilter, reasonFilter]);
  const csvPreviewItems = useMemo(() => batch?.items.filter((item) => item.reviewStatus === "approved" || item.reviewStatus === "exported").slice(0, 5) || [], [batch]);
  const exportIssues = useMemo(() => {
    if (!batch) return [];
    return batch.items
      .filter((item) => item.reviewStatus === "approved" || item.reviewStatus === "exported")
      .flatMap((item) => {
        const errors: string[] = [];
        if (!item.copy.headline.trim()) errors.push(`${item.productCode}: headline ว่าง`);
        if (!item.copy.priceText.trim()) errors.push(`${item.productCode}: priceText ว่าง`);
        if (!item.copy.cta.trim()) errors.push(`${item.productCode}: CTA ว่าง`);
        if (!item.copy.facebookCaption.trim()) errors.push(`${item.productCode}: caption ว่าง`);
        if (item.copy.facebookCaption.length > 2200) errors.push(`${item.productCode}: caption ยาวเกิน 2200 ตัวอักษร`);
        return errors;
      });
  }, [batch]);

  useEffect(() => {
    loadSavedBatches();
  }, []);

  async function loadSavedBatches() {
    try {
      const res = await fetch("/api/promotions/batches", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setSavedBatches(data.batches || []);
    } catch {
      setSavedBatches([]);
    }
  }

  async function refreshCandidates() {
    setLoading(true);
    try {
      const res = await fetch("/api/promotions/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 500, minCost: Number(minCost || 0) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "โหลดสินค้าโปรโมชันไม่สำเร็จ");
      setCandidates(data.candidates || []);
      setSelectedCodes(new Set((data.candidates || []).slice(0, 12).map((item: PromotionCandidate) => item.productCode)));
      toast.success("อัปเดต candidate จาก stock/price ล่าสุดแล้ว");
    } catch (error: any) {
      toast.error(error.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  function toggleCandidate(code: string) {
    setSelectedCodes((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else if (next.size < 500) next.add(code);
      else toast.error("เลือกได้สูงสุด 500 สินค้าต่อ batch");
      return next;
    });
  }

  async function createBatch() {
    if (selectedCodes.size === 0) {
      toast.error("เลือกสินค้าอย่างน้อย 1 รายการ");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/promotions/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Canva Promotion ${new Date().toLocaleDateString("th-TH")}`,
          productCodes: Array.from(selectedCodes),
          campaignType,
          templatePreset
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "สร้าง batch ไม่สำเร็จ");
      setBatch(data);
      setSavedBatches((current) => [data, ...current.filter((item) => item.id !== data.id)]);
      toast.success("สร้าง copy และ batch สำหรับ review แล้ว");
    } catch (error: any) {
      toast.error(error.message || "สร้าง batch ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function updateReview(itemId: string, reviewStatus: PromotionReviewStatus) {
    if (!batch) return;
    const res = await fetch("/api/promotions/review", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId: batch.id, itemId, reviewStatus })
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "อัปเดตสถานะไม่สำเร็จ");
      return;
    }
    setBatch(data);
    setSavedBatches((current) => current.map((item) => item.id === data.id ? data : item));
  }

  async function updateBatchReview(reviewStatus: PromotionReviewStatus) {
    if (!batch) return;
    const res = await fetch("/api/promotions/review", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId: batch.id, scope: "batch", reviewStatus })
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "อัปเดตสถานะทั้ง batch ไม่สำเร็จ");
      return;
    }
    setBatch(data);
    setSavedBatches((current) => current.map((item) => item.id === data.id ? data : item));
    toast.success(reviewStatus === "approved" ? "Approve ทั้ง batch แล้ว" : "ส่งกลับไป review ทั้ง batch แล้ว");
  }

  async function updateCopy(itemId: string, copy: PromotionCopy) {
    if (!batch) return;
    const res = await fetch("/api/promotions/review", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId: batch.id, itemId, copy })
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "บันทึก copy ไม่สำเร็จ");
      return;
    }
    setBatch(data);
    setSavedBatches((current) => current.map((item) => item.id === data.id ? data : item));
    toast.success("บันทึก copy แล้ว และส่งกลับไป review");
  }

  return (
    <main className="appShell">
      <div className="appPage">
        <nav className="topNav" aria-label="เมนูหลัก">
          <Link href="/">แผนจากสต็อก</Link>
          <Link href="/trend-planner">แผนจากเทรนด์</Link>
          <Link href="/promotion-combo">Promotion Combo</Link>
          <Link className="activeNav" href="/promotions">Promotion Bulk</Link>
          <Link href="/content-creator">สร้างคอนเทนต์ด้วย AI</Link>
          <Link href="/guide">คู่มือการใช้งาน</Link>
        </nav>

        <header className="appHero">
          <div>
            <p className="eyebrow">Promotion Content Module</p>
            <h1>สร้างโปรโมชันจาก stock และราคาจริง แล้ว export เข้า Canva Bulk Create</h1>
            <p className="intro">
              อ่านข้อมูลจาก stock/price เดิมเท่านั้น เลือกสินค้าได้สูงสุด 500 รายการ สร้าง copy ภาษาไทยแบบไม่แต่งสเปค และให้ตรวจทานก่อน export CSV
            </p>
          </div>
          <div className="statusBox">
            <p>Workflow</p>
            <strong>{batch ? `${approvedCount}/${batch.items.length} approved` : `${selectedCount} selected`}</strong>
            <span>ไม่ auto-post Facebook และไม่ generate รูปภาพโดยตรง</span>
          </div>
        </header>

        <section className="gridTwo">
          <div className="panel stepPanel">
            <div className="sectionHeader">
              <h2>1. Promotion Candidates</h2>
            </div>
            <p className="emptyText" style={{ marginBottom: 12 }}>
              ระบบตัดสินค้าชื่อซ้ำออกโดยเก็บตัวที่ Aging สูงสุด และกรองสินค้าต้นทุนต่ำกว่าค่าที่กำหนดได้
            </p>
            <div className="planActions" style={{ marginBottom: 12 }}>
              <SelectField label="Campaign Type" value={campaignType} onChange={(value) => setCampaignType(value as PromotionCampaignType)}>
                <option value="clearance">เคลียร์สต็อก</option>
                <option value="special-price">โปรราคาพิเศษ</option>
                <option value="limited-stock">ของมีจำนวนจำกัด</option>
                <option value="back-to-school">Back to School</option>
                <option value="gaming-upgrade">Gaming Upgrade</option>
              </SelectField>
              <SelectField label="Canva Template" value={templatePreset} onChange={(value) => setTemplatePreset(value as PromotionTemplatePreset)}>
                <option value="clearance">Clearance</option>
                <option value="notebook">Notebook</option>
                <option value="gaming-gear">Gaming Gear</option>
                <option value="printer">Printer</option>
                <option value="accessory">Accessory</option>
              </SelectField>
              <label className="fileInput" style={{ minWidth: 180 }}>
                <span>ราคาทุนขั้นต่ำ</span>
                <input
                  className="trendBox"
                  inputMode="numeric"
                  placeholder="เช่น 1000"
                  value={minCost}
                  onChange={(event) => setMinCost(event.target.value.replace(/[^0-9.]/g, ""))}
                />
              </label>
              <SelectField label="หมวดสินค้า" value={categoryFilter} onChange={setCategoryFilter}>
                <option value="all">ทุกหมวด</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </SelectField>
              <SelectField label="เหตุผลโปรโมชัน" value={reasonFilter} onChange={setReasonFilter}>
                <option value="all">ทุกเหตุผล</option>
                <option value="aged-stock">Aging 90+</option>
                <option value="high-margin">High margin</option>
                <option value="seasonal-it">Seasonal IT</option>
                <option value="missing-price">Missing price</option>
                <option value="healthy-stock">Healthy stock</option>
              </SelectField>
              <button className="secondaryButton" onClick={refreshCandidates} disabled={loading}>
                รีเฟรชจาก stock/price ล่าสุด
              </button>
              <button className="primaryButton" onClick={createBatch} disabled={loading || selectedCount === 0}>
                สร้าง batch + copy ภาษาไทย
              </button>
            </div>
            <div style={{ maxHeight: 520, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredCandidates.map((candidate) => (
                <label key={candidate.productCode} className="assetBox" style={{ display: "flex", gap: 12, cursor: "pointer" }}>
                  <input type="checkbox" checked={selectedCodes.has(candidate.productCode)} onChange={() => toggleCandidate(candidate.productCode)} style={{ marginTop: 4 }} />
                  <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <strong>{candidate.productName}</strong>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      {candidate.productCode} | {candidate.itemType || "สินค้า IT"} | score {candidate.score} | stock {candidate.qty} | aging {candidate.agingDays} วัน | cost {moneyFormatter.format(candidate.cost)}
                    </span>
                    <span style={{ color: "#86efac", fontSize: "0.85rem" }}>
                      {candidate.sellPrice ? moneyFormatter.format(candidate.sellPrice) : "ไม่มีราคาขายกลาง ใช้ fallback ให้ทักเช็กราคา"}
                    </span>
                    <span style={{ fontSize: "0.82rem" }}>{candidate.recommendation}</span>
                  </span>
                </label>
              ))}
              {filteredCandidates.length === 0 ? <p className="emptyText">ไม่พบสินค้าตาม filter ปัจจุบัน</p> : null}
            </div>
          </div>

          <div className="panel stepPanel">
            <div className="sectionHeader">
              <h2>2. Review ก่อน Export</h2>
            </div>
            {savedBatches.length > 0 ? (
              <div className="assetBox" style={{ marginBottom: 12 }}>
                <h4>Batch History</h4>
                <select className="trendBox" value={batch?.id || ""} onChange={(event) => setBatch(savedBatches.find((item) => item.id === event.target.value) || null)}>
                  <option value="">เลือก batch เก่า</option>
                  {savedBatches.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} | {item.status} | {item.items.length} รายการ</option>
                  ))}
                </select>
              </div>
            ) : null}
            {!batch ? (
              <p className="emptyText">สร้าง batch ก่อน ระบบจะแสดง copy, caption และสถานะ review ของแต่ละสินค้า</p>
            ) : (
              <>
                <div className="moneyLine">
                  <span>{batch.name}</span>
                  <strong>{batch.items.length} รายการ | {batch.campaignType || "clearance"} | {batch.templatePreset || "clearance"}</strong>
                </div>
                <div className="planActions" style={{ marginBottom: 12 }}>
                  <button className="secondaryButton" onClick={() => updateBatchReview("approved")}>Approve All</button>
                  <a
                    className={approvedCount > 0 && exportIssues.length === 0 ? "primaryButton" : "secondaryButton"}
                    href={approvedCount > 0 && exportIssues.length === 0 ? `/api/promotions/export/canva-csv?batchId=${batch.id}` : undefined}
                    aria-disabled={approvedCount === 0 || exportIssues.length > 0}
                    onClick={(event) => {
                      if (approvedCount === 0) {
                        event.preventDefault();
                        toast.error("ต้อง approve อย่างน้อย 1 รายการก่อน export");
                      } else if (exportIssues.length > 0) {
                        event.preventDefault();
                        toast.error("ยัง export ไม่ได้: ตรวจ validation ก่อน");
                      }
                    }}
                    style={{ textAlign: "center", textDecoration: "none" }}
                  >
                    Export Canva CSV
                  </a>
                </div>
                {exportIssues.length > 0 ? (
                  <div className="assetBox" style={{ marginBottom: 12, borderColor: "rgba(248,113,113,0.5)" }}>
                    <h4>Export Validation</h4>
                    {exportIssues.map((issue) => <p key={issue} style={{ color: "#fca5a5" }}>{issue}</p>)}
                  </div>
                ) : null}
                <CsvPreview approvedCount={approvedCount} items={csvPreviewItems} />
                <div style={{ maxHeight: 620, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                  {batch.items.map((item) => (
                    <ReviewCard key={item.id} item={item} onReject={() => updateReview(item.id, "rejected")} onApprove={() => updateReview(item.id, "approved")} onSave={(copy) => updateCopy(item.id, copy)} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="fileInput" style={{ minWidth: 180 }}>
      <span>{label}</span>
      <select className="trendBox" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function CsvPreview({ approvedCount, items }: { approvedCount: number; items: PromotionBatch["items"] }) {
  return (
    <div className="assetBox" style={{ marginBottom: 12 }}>
      <h4>CSV Preview ({approvedCount} approved)</h4>
      {items.length === 0 ? (
        <p className="emptyText">Approve อย่างน้อย 1 รายการเพื่อดูตัวอย่าง CSV ก่อน export</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 6 }}>product_code</th>
                <th style={{ textAlign: "left", padding: 6 }}>headline</th>
                <th style={{ textAlign: "left", padding: 6 }}>price_text</th>
                <th style={{ textAlign: "left", padding: 6 }}>cta</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: 6 }}>{item.productCode}</td>
                  <td style={{ padding: 6 }}>{item.copy.headline}</td>
                  <td style={{ padding: 6 }}>{item.copy.priceText}</td>
                  <td style={{ padding: 6 }}>{item.copy.cta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ item, onApprove, onReject, onSave }: { item: PromotionBatch["items"][number]; onApprove: () => void; onReject: () => void; onSave: (copy: PromotionCopy) => void }) {
  const [draftCopy, setDraftCopy] = useState(item.copy);

  useEffect(() => {
    setDraftCopy(item.copy);
  }, [item.copy]);

  function updateField(field: keyof PromotionCopy, value: string) {
    setDraftCopy((current) => ({ ...current, [field]: value }));
  }

  return (
    <article className="planCard">
      <div className="planTopline">
        <span className="priorityPill">score {item.score}</span>
        <span className={`statusPill ${item.reviewStatus === "approved" ? "approved" : "draft"}`}>{item.reviewStatus}</span>
      </div>
      <h3>{item.productName}</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
        {item.productCode} | stock {item.qty} | aging {item.agingDays} วัน | {item.sellPrice ? moneyFormatter.format(item.sellPrice) : "ไม่มีราคาขายกลาง"}
      </p>
      <label className="fileInput"><span>Headline</span><input className="trendBox" value={draftCopy.headline} onChange={(event) => updateField("headline", event.target.value)} /></label>
      <label className="fileInput"><span>Body Copy</span><textarea className="trendBox" rows={3} value={draftCopy.bodyCopy} onChange={(event) => updateField("bodyCopy", event.target.value)} /></label>
      <label className="fileInput"><span>Price Text</span><input className="trendBox" value={draftCopy.priceText} onChange={(event) => updateField("priceText", event.target.value)} /></label>
      <label className="fileInput"><span>CTA</span><input className="trendBox" value={draftCopy.cta} onChange={(event) => updateField("cta", event.target.value)} /></label>
      <label className="fileInput"><span>Facebook Caption</span><textarea className="trendBox" rows={6} value={draftCopy.facebookCaption} onChange={(event) => updateField("facebookCaption", event.target.value)} /></label>
      <label className="fileInput"><span>Disclaimer</span><input className="trendBox" value={draftCopy.disclaimer} onChange={(event) => updateField("disclaimer", event.target.value)} /></label>
      <label className="fileInput">
        <span>Hashtags</span>
        <input className="trendBox" value={draftCopy.hashtags.join(" ")} onChange={(event) => setDraftCopy((current) => ({ ...current, hashtags: event.target.value.split(/\s+/).filter(Boolean) }))} />
      </label>
      <div className="planActions">
        <button className="secondaryButton compactButton" onClick={onReject}>Reject</button>
        <button className="secondaryButton compactButton" onClick={() => onSave(draftCopy)}>Save Copy</button>
        <button className="primaryButton compactButton" onClick={onApprove}>Approve</button>
      </div>
    </article>
  );
}
