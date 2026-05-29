import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { updatePlannerState } from "../../../services/storage";
import { calculateMarkedUpPrice } from "../../../utils/categoryUtils";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Product code is required" }, { status: 400 });
    }

    const isLocal = process.env.NODE_ENV === "development";

    const executablePath = isLocal 
      ? process.env.CHROME_EXECUTABLE_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      : await chromium.executablePath();

    const browser = await puppeteer.launch({ 
      args: isLocal ? [] : chromium.args,
      executablePath,
      headless: isLocal ? true : ((chromium as any).headless === true ? true : false),
    });
    const page = await browser.newPage();
    
    // Advice search URL
    const url = `https://www.advice.co.th/product/search?keyword=${encodeURIComponent(code)}`;
    
    await page.goto(url, { waitUntil: "networkidle2" });

    // Try to extract price
    const priceStr = await page.evaluate(() => {
      // Find the price element. Advice usually has .price or .product-price
      const el = document.querySelector('.price, .product-price, [class*="price-sal"]');
      return el ? el.textContent : null;
    });

    await browser.close();

    if (!priceStr) {
      return NextResponse.json({ error: "ไม่พบราคาใน Advice" }, { status: 404 });
    }

    // Clean up price string, e.g. "21,000.-" -> 21000
    const rawPrice = priceStr.replace(/[^0-9.]/g, '');
    const price = parseFloat(rawPrice);

    let markedUpPrice = price;

    // Persist and apply markup
    await updatePlannerState((state) => {
      const itemIndex = state.inventory.findIndex(i => i.code === code);
      if (itemIndex > -1) {
        const itemType = state.inventory[itemIndex].itemType;
        const finalPrice = calculateMarkedUpPrice(price, itemType) ?? price;
        markedUpPrice = finalPrice;
        
        state.inventory[itemIndex] = {
          ...state.inventory[itemIndex],
          sellPrice: finalPrice,
          projectedRevenue: Number((finalPrice * state.inventory[itemIndex].qty).toFixed(2))
        };
      }
      return state;
    });

    return NextResponse.json({ price: markedUpPrice });
  } catch (error: unknown) {
    console.error("Scrape error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
