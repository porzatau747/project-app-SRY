import type {
  PromotionBatchItem,
  PromotionCampaignType,
  PromotionCandidate,
  PromotionCopy,
  PromotionTemplatePreset
} from "../types/promotion";
import { buildFacebookCaption } from "./facebook-caption-generator";

const numberFormatter = new Intl.NumberFormat("th-TH");

type PromotionCopyContext = {
  campaignType?: PromotionCampaignType;
  templatePreset?: PromotionTemplatePreset;
};

function priceText(candidate: Pick<PromotionCandidate, "sellPrice" | "cost">) {
  if (candidate.sellPrice && candidate.sellPrice > 0) {
    return `ราคา ${numberFormatter.format(candidate.sellPrice)} บาท`;
  }
  if (candidate.cost && candidate.cost > 0) {
    return "ทักแชตเพื่อเช็กราคาขายล่าสุด";
  }
  return "สอบถามราคาหน้าร้านหรือทักแชตได้เลย";
}

function safeCategory(itemType: string) {
  return itemType?.trim() || "สินค้า IT";
}

function campaignHeadlinePrefix(campaignType: PromotionCampaignType) {
  if (campaignType === "clearance") return "โปรเคลียร์สต็อก";
  if (campaignType === "limited-stock") return "ของมีจำนวนจำกัด";
  if (campaignType === "back-to-school") return "Back to School";
  if (campaignType === "gaming-upgrade") return "อัปเกรดเกมมิ่ง";
  return "โปรราคาพิเศษ";
}

function campaignBodyAngle(campaignType: PromotionCampaignType) {
  if (campaignType === "clearance") return "รอบนี้เน้นความคุ้มค่าและจำนวนจำกัด เหมาะกับคนที่อยากได้ของใช้จริงก่อนหมดรอบ";
  if (campaignType === "limited-stock") return "เหมาะกับลูกค้าที่ไม่อยากพลาดสินค้าพร้อมขาย เพราะจำนวนมีจำกัด";
  if (campaignType === "back-to-school") return "เหมาะสำหรับเตรียมอุปกรณ์เรียน ทำงานเอกสาร และใช้งานประจำวัน";
  if (campaignType === "gaming-upgrade") return "เหมาะกับสายเกมมิ่งที่อยากอัปเกรดโต๊ะคอมให้พร้อมกว่าเดิม";
  return "เหมาะสำหรับลูกค้าที่กำลังมองหาสินค้า IT ใช้งานจริงในราคาที่เช็กได้จากหน้าร้าน";
}

function templateHashtags(templatePreset: PromotionTemplatePreset) {
  if (templatePreset === "notebook") return ["#Notebook", "#โน้ตบุ๊ก"];
  if (templatePreset === "gaming-gear") return ["#GamingGear", "#เกมมิ่ง"];
  if (templatePreset === "printer") return ["#Printer", "#ปริ้นเตอร์"];
  if (templatePreset === "accessory") return ["#Accessories", "#อุปกรณ์ไอที"];
  return ["#Clearance", "#เคลียร์สต็อก"];
}

export function generatePromotionCopy(candidate: PromotionCandidate, context: PromotionCopyContext = {}): PromotionCopy {
  const campaignType = context.campaignType || "clearance";
  const templatePreset = context.templatePreset || "clearance";
  const price = priceText(candidate);
  const category = safeCategory(candidate.itemType);
  const limitedStockText = candidate.qty <= 3 ? "เหลือจำนวนจำกัด" : `มีพร้อมขาย ${candidate.qty} ชิ้น`;
  const stockText = candidate.agingDays >= 90
    ? `สินค้าค้างสต็อก ${candidate.agingDays} วัน จัดเป็นตัวคุ้มประจำรอบนี้`
    : "สินค้า stock พร้อมขาย";

  const headline = `${campaignHeadlinePrefix(campaignType)} ${candidate.productName}`;
  const subheadline = `${category} | ${limitedStockText}`;
  const bodyCopy = `${stockText} ${campaignBodyAngle(campaignType)}`;
  const cta = "ทักแชตเช็กสินค้าและราคาล่าสุด หรือแวะที่ Advice สามร้อยยอด";
  const disclaimer = candidate.sellPrice
    ? "ราคาและจำนวนสินค้าอาจเปลี่ยนแปลงได้ กรุณาทักเช็กก่อนสั่งซื้อ"
    : "ยังไม่มีราคาขายกลางในระบบ กรุณาทักเช็กราคาล่าสุดก่อนสั่งซื้อ";

  return {
    headline,
    subheadline,
    priceText: price,
    bodyCopy,
    cta,
    facebookCaption: buildFacebookCaption({ headline, subheadline, priceText: price, bodyCopy, cta, disclaimer }),
    disclaimer,
    hashtags: ["#Adviceสามร้อยยอด", "#โปรไอที", ...templateHashtags(templatePreset)]
  };
}

export function buildBatchItem(candidate: PromotionCandidate, index: number, context: PromotionCopyContext = {}): PromotionBatchItem {
  return {
    id: `${candidate.productCode}-${Date.now()}-${index}`,
    productCode: candidate.productCode,
    productName: candidate.productName,
    itemType: candidate.itemType,
    qty: candidate.qty,
    agingDays: candidate.agingDays,
    cost: candidate.cost,
    sellPrice: candidate.sellPrice,
    margin: candidate.margin,
    score: candidate.score,
    reasons: candidate.reasons,
    recommendation: candidate.recommendation,
    reviewStatus: "needs_review",
    copy: generatePromotionCopy(candidate, context),
    sourceSnapshot: candidate.source
  };
}
