import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

let rootDir = process.cwd();
if (rootDir.includes('scraping-worker') || rootDir.includes('web-app')) {
    rootDir = path.resolve(rootDir, '../../');
}
const dataDir = path.resolve(rootDir, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const stockPath = path.join(dataDir, 'stock.xlsx');
const pricePath = path.join(dataDir, 'prices.xlsx');

async function run() {
  console.log("Starting Playwright scraper...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    acceptDownloads: true,
  });
  const page = await context.newPage();

  try {
    console.log("Navigating to login...");
    await page.goto('https://branch.nescen.in.th/', { waitUntil: 'networkidle' });
    
    await page.fill('#username', '685409');
    await page.fill('#pass', 'Adv@02573');
    
    await page.click('#loginId');
    
    console.log("Selecting branch...");
    await page.waitForSelector('#authen-branch option', { state: 'attached', timeout: 10000 }).catch(() => null);
    
    await page.evaluate(() => {
      const select = document.querySelector('#authen-branch') as HTMLSelectElement;
      if (select && select.options.length > 0) {
         const branch = select.options[0].value;
         if (typeof (window as any).set_session === 'function') {
             (window as any).set_session(branch);
         }
      } else {
         console.warn("No branch options found in #authen-branch!");
      }
    });

    try {
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch(e) {
        console.warn("Navigation wait timeout, continuing...");
    }
    await page.waitForTimeout(2000);

    console.log("Fetching stock data...");
    await page.goto('https://branch.nescen.in.th/55000067/index.php/shop/report_store', { waitUntil: 'networkidle' });
    
    await page.click('#screenid');
    await page.waitForTimeout(3000);

    console.log("Exporting stock to Excel...");
    
    // Listen for all downloads
    const downloads: any[] = [];
    page.on('download', d => downloads.push(d));
    
    await page.evaluate(() => {
        if (typeof (window as any).export_excel === 'function') {
            (window as any).export_excel();
        } else {
            const btn = document.querySelector('.buttons-excel');
            if (btn) (btn as HTMLElement).click();
        }
    });

    console.log("Waiting for downloads to trigger (10 seconds)...");
    await page.waitForTimeout(10000);

    let selectedDownload = null;
    for (const d of downloads) {
      console.log("Caught download:", d.suggestedFilename());
      // We want the file containing "By SN"
      if (d.suggestedFilename().includes('SN')) {
        selectedDownload = d;
      }
    }
    
    if (!selectedDownload && downloads.length > 0) {
      console.log("Fallback: using the last triggered download");
      selectedDownload = downloads[downloads.length - 1];
    }

    if (selectedDownload) {
      if (fs.existsSync(stockPath)) fs.unlinkSync(stockPath);
      await selectedDownload.saveAs(stockPath);
      console.log("Stock data saved to", stockPath);
    } else {
      console.warn("Failed to download stock file (download event not triggered).");
    }

    console.log("Fetching price data...");
    await page.goto('https://branch.nescen.in.th/55000067/index.php/shop/model_price_config', { waitUntil: 'networkidle' });

    await page.waitForTimeout(2000);
    // Find all category links that call loadData
    const categories = await page.evaluate(() => {
        const els = document.querySelectorAll('a[onclick^="loadData"]');
        const names = Array.from(els).map(e => e.textContent?.trim()).filter(Boolean) as string[];
        return Array.from(new Set(names)); // Return unique names
    });

    console.log(`Found ${categories.length} categories to scrape.`);

    let allPriceData: any[] = [];
    for (const cat of categories) {
      console.log(`Scraping category: ${cat}`);
      try {
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 5000 }).catch(() => null);
        const exactLoc = page.locator('.CTAs, .nav-item a, a[onclick^="loadData"]').getByText(cat, { exact: true }).first();
        if (await exactLoc.count() > 0) {
           await exactLoc.click({ force: true, timeout: 5000 });
        } else {
           const loc = page.locator(`a:has-text("${cat}")`).filter({ has: page.locator('xpath=ancestor::div[@id="sidebar" or @class="sidebar"]') }).first();
           if (await loc.count() > 0) {
               await loc.click({ force: true, timeout: 5000 });
           } else {
               // Fallback: evaluate via JS directly
               const clicked = await page.evaluate((categoryText) => {
                 const links = Array.from(document.querySelectorAll('.CTAs, a'));
                 const catLink = links.find(el => el.textContent?.trim() === categoryText && el.getAttribute('onclick')?.includes('loadData'));
                 if (catLink) {
                   (catLink as HTMLElement).click();
                   return true;
                 }
                 return false;
               }, cat);
               
               if (!clicked) {
                   console.warn(`Could not find category link: ${cat}`);
                   continue;
               }
           }
        }
      } catch (e) {
        console.warn(`Failed to click category: ${cat}`, e);
        continue;
      }

      await page.waitForTimeout(2000);
      
      await page.waitForTimeout(500); // give it a moment to start loading
      await page.waitForSelector('#loading', { state: 'visible', timeout: 2000 }).catch(() => null);
      await page.waitForSelector('#loading', { state: 'hidden', timeout: 15000 }).catch(() => null);
      
      const rows = await page.evaluate((category) => {
        // @ts-ignore
        const data = typeof arrPrice !== 'undefined' ? arrPrice : [];
        return data.map((item: any) => ({
          Code: item.code || '',
          Product: item.product_name || '',
          'Sell price': item.sp1 || '',
          Itemtype: category
        }));
      }, cat);
      
      allPriceData = allPriceData.concat(rows);
    }

    console.log(`Saving ${allPriceData.length} price records...`);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(allPriceData);
    XLSX.utils.book_append_sheet(wb, ws, "Prices");
    XLSX.writeFile(wb, pricePath);
    console.log("SUCCESS");

  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await browser.close();
  }
}
run();
