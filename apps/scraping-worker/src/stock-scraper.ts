import { chromium, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

type Mode = 'stock' | 'price' | 'all';

type ScraperConfig = {
  mode: Mode;
  headless: boolean;
  baseUrl: string;
  branchId: string;
  username: string;
  password: string;
  stockTimeoutMs: number;
  categoryTimeoutMs: number;
  categoryRetries: number;
  categoryDelayMs: number;
  categories?: string[];
  categoryLimit?: number;
};

type CategoryResult = {
  category: string;
  rows: number;
  attempts: number;
  status: 'success' | 'failed';
  error?: string;
};

let rootDir = process.cwd();
if (rootDir.includes('scraping-worker') || rootDir.includes('web-app')) {
  rootDir = path.resolve(rootDir, '../../');
}
const dataDir = path.resolve(rootDir, 'data');
const logDir = path.resolve(dataDir, 'scrape-logs');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const stockPath = path.join(dataDir, 'stock.xlsx');
const pricePath = path.join(dataDir, 'prices.xlsx');

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    value = value.replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.resolve(rootDir, '.env'));
loadEnvFile(path.resolve(rootDir, 'apps/web-app/.env'));
loadEnvFile(path.resolve(rootDir, 'apps/web-app/.env.local'));

function argValue(name: string, fallback?: string) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--')) return process.argv[idx + 1];
  return fallback;
}

function argFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function intArg(name: string, fallback: number) {
  const value = argValue(name);
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseConfig(): ScraperConfig {
  const mode = (argValue('mode', process.env.BRANCH_SCRAPER_MODE || 'all') || 'all') as Mode;
  if (!['stock', 'price', 'all'].includes(mode)) throw new Error(`Invalid --mode=${mode}. Use stock, price, or all.`);
  const username = process.env.BRANCH_BACKEND_USERNAME || '';
  const password = process.env.BRANCH_BACKEND_PASSWORD || '';
  if (!username || !password) {
    throw new Error('Missing BRANCH_BACKEND_USERNAME or BRANCH_BACKEND_PASSWORD in .env');
  }
  const categoriesRaw = argValue('categories', process.env.BRANCH_PRICE_CATEGORIES || '');
  return {
    mode,
    headless: !argFlag('headful'),
    baseUrl: (process.env.BRANCH_BACKEND_BASE_URL || 'https://branch.nescen.in.th').replace(/\/$/, ''),
    branchId: process.env.BRANCH_BACKEND_BRANCH_ID || '55000067',
    username,
    password,
    stockTimeoutMs: intArg('stock-timeout-ms', Number(process.env.BRANCH_STOCK_TIMEOUT_MS || 120000)),
    categoryTimeoutMs: intArg('category-timeout-ms', Number(process.env.BRANCH_CATEGORY_TIMEOUT_MS || 45000)),
    categoryRetries: intArg('category-retries', Number(process.env.BRANCH_CATEGORY_RETRIES || 2)),
    categoryDelayMs: intArg('category-delay-ms', Number(process.env.BRANCH_CATEGORY_DELAY_MS || 2000)),
    categories: categoriesRaw ? categoriesRaw.split(',').map((c) => c.trim()).filter(Boolean) : undefined,
    categoryLimit: argValue('category-limit') ? intArg('category-limit', 0) : undefined,
  };
}

function logLine(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function login(page: Page, config: ScraperConfig) {
  logLine('Navigating to login...');
  await page.goto(`${config.baseUrl}/`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.fill('#username', config.username);
  await page.fill('#pass', config.password);
  await page.click('#loginId');

  logLine('Selecting branch...');
  await page.waitForSelector('#authen-branch option', { state: 'attached', timeout: 10000 }).catch(() => null);
  await page.evaluate(() => {
    const select = document.querySelector('#authen-branch') as HTMLSelectElement | null;
    if (select && select.options.length > 0) {
      const branch = select.options[0].value;
      if (typeof (window as any).set_session === 'function') (window as any).set_session(branch);
    } else {
      console.warn('No branch options found in #authen-branch.');
    }
  });
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null);
  await page.waitForTimeout(2000);
}

async function scrapeStock(page: Page, config: ScraperConfig) {
  logLine('Fetching stock data...');
  page.setDefaultTimeout(config.stockTimeoutMs);
  await page.goto(`${config.baseUrl}/${config.branchId}/index.php/shop/report_store`, { waitUntil: 'networkidle', timeout: config.stockTimeoutMs });
  await page.click('#screenid', { timeout: config.stockTimeoutMs });
  await page.waitForTimeout(3000);

  logLine('Exporting stock to Excel...');
  const downloads: any[] = [];
  page.on('download', (d) => downloads.push(d));

  await page.evaluate(() => {
    if (typeof (window as any).export_excel === 'function') {
      (window as any).export_excel();
    } else {
      const btn = document.querySelector('.buttons-excel');
      if (btn) (btn as HTMLElement).click();
    }
  });

  await page.waitForTimeout(10000);
  let selectedDownload = downloads.find((d) => d.suggestedFilename().includes('SN')) || downloads.at(-1);
  if (!selectedDownload) throw new Error('Failed to download stock file: no download event triggered.');
  if (fs.existsSync(stockPath)) fs.unlinkSync(stockPath);
  await selectedDownload.saveAs(stockPath);
  logLine(`Stock data saved to ${stockPath}`);
}

async function listCategories(page: Page, config: ScraperConfig) {
  await page.goto(`${config.baseUrl}/${config.branchId}/index.php/shop/model_price_config`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  let categories = await page.evaluate(() => {
    const els = document.querySelectorAll('a[onclick^="loadData"]');
    const names = Array.from(els).map((e) => e.textContent?.trim()).filter(Boolean) as string[];
    return Array.from(new Set(names));
  });
  if (config.categories?.length) {
    const wanted = new Set(config.categories);
    categories = categories.filter((cat) => wanted.has(cat));
  }
  if (config.categoryLimit && config.categoryLimit > 0) categories = categories.slice(0, config.categoryLimit);
  return categories;
}

function parseLoadDataArgs(onclick: string) {
  const match = onclick.match(/loadData\((.*)\);?/);
  if (!match) return null;
  const args: string[] = [];
  const regex = /'([^']*)'/g;
  let current: RegExpExecArray | null;
  while ((current = regex.exec(match[1])) !== null) args.push(current[1]);
  return args.length >= 4 ? args : null;
}

async function loadCategory(page: Page, category: string) {
  const exactLoc = page.locator('.CTAs, .nav-item a, a[onclick^="loadData"]').getByText(category, { exact: true }).first();
  if (await exactLoc.count() > 0) {
    const onclick = await exactLoc.getAttribute('onclick');
    const args = onclick ? parseLoadDataArgs(onclick) : null;
    if (args) {
      await page.evaluate(async (loadArgs) => {
        await (window as any).loadData(loadArgs[0], loadArgs[1], loadArgs[2], loadArgs[3]);
      }, args);
      return;
    }
    await exactLoc.click({ force: true, timeout: 8000 });
    return;
  }
  const loaded = await page.evaluate(async (categoryText) => {
    const links = Array.from(document.querySelectorAll('.CTAs, a'));
    const catLink = links.find((el) => el.textContent?.trim() === categoryText && el.getAttribute('onclick')?.includes('loadData'));
    if (catLink) {
      const onclick = catLink.getAttribute('onclick') || '';
      const match = onclick.match(/loadData\((.*)\);?/);
      const args: string[] = [];
      const regex = /'([^']*)'/g;
      let current: RegExpExecArray | null;
      while ((current = regex.exec(match?.[1] || '')) !== null) args.push(current[1]);
      if (args.length >= 4 && typeof (window as any).loadData === 'function') {
        await (window as any).loadData(args[0], args[1], args[2], args[3]);
      } else {
        (catLink as HTMLElement).click();
      }
      return true;
    }
    return false;
  }, category);
  if (!loaded) throw new Error(`Could not find category link: ${category}`);
}

async function withCategoryTimeout<T>(promise: Promise<T>, timeoutMs: number, category: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Category timed out after ${timeoutMs}ms: ${category}`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function scrapeCategory(page: Page, category: string, config: ScraperConfig) {
  await page.waitForSelector('#loading', { state: 'hidden', timeout: 5000 }).catch(() => null);
  await loadCategory(page, category);
  await page.waitForTimeout(config.categoryDelayMs);
  await page.waitForSelector('#loading', { state: 'visible', timeout: 2000 }).catch(() => null);
  await page.waitForSelector('#loading', { state: 'hidden', timeout: config.categoryTimeoutMs }).catch(() => null);
  const rows = await page.evaluate((cat) => {
    // The backend page declares arrPrice in page scope, not always as window.arrPrice.
    const data = (0, eval)("typeof arrPrice !== 'undefined' ? arrPrice : []");
    return data.map((item: any) => ({
      Code: item.code || '',
      Product: item.product_name || '',
      'Sell price': item.sp1 || '',
      Itemtype: cat,
    }));
  }, category);
  return rows;
}

async function scrapePrice(page: Page, config: ScraperConfig) {
  logLine('Fetching price data...');
  page.setDefaultTimeout(config.categoryTimeoutMs);
  let categories = await listCategories(page, config);
  logLine(`Found ${categories.length} categories to scrape.`);
  if (categories.length === 0) throw new Error('No price categories found.');

  const allPriceData: any[] = [];
  const results: CategoryResult[] = [];

  for (let index = 0; index < categories.length; index++) {
    const category = categories[index];
    logLine(`Scraping category ${index + 1}/${categories.length}: ${category}`);
    let success = false;
    let lastError = '';
    for (let attempt = 1; attempt <= config.categoryRetries + 1; attempt++) {
      try {
        const rows = await withCategoryTimeout(scrapeCategory(page, category, config), config.categoryTimeoutMs + 10000, category);
        allPriceData.push(...rows);
        results.push({ category, rows: rows.length, attempts: attempt, status: 'success' });
        logLine(`Category success: ${category} rows=${rows.length} attempts=${attempt}`);
        success = true;
        break;
      } catch (error: any) {
        lastError = error?.message || String(error);
        logLine(`Category failed attempt ${attempt}/${config.categoryRetries + 1}: ${category} error=${lastError}`);
        await page.screenshot({ path: path.join(logDir, `price-failed-${Date.now()}.png`), fullPage: true }).catch(() => null);
        await page.goto(`${config.baseUrl}/${config.branchId}/index.php/shop/model_price_config`, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => null);
        await page.waitForTimeout(1000);
      }
    }
    if (!success) results.push({ category, rows: 0, attempts: config.categoryRetries + 1, status: 'failed', error: lastError });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allPriceData), 'Prices');
  XLSX.writeFile(wb, pricePath);

  const summaryPath = path.join(logDir, `price-summary-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(summaryPath, JSON.stringify({ createdAt: new Date().toISOString(), pricePath, totalRows: allPriceData.length, results }, null, 2), 'utf-8');
  const failed = results.filter((r) => r.status === 'failed');
  logLine(`Price data saved to ${pricePath}`);
  logLine(`Price scrape summary saved to ${summaryPath}`);
  logLine(`price_rows=${allPriceData.length}; categories_success=${results.length - failed.length}; categories_failed=${failed.length}`);
  if (failed.length) throw new Error(`Price scrape finished with failed categories: ${failed.map((f) => f.category).join(', ')}`);
}

async function run() {
  const config = parseConfig();
  logLine(`Starting Playwright scraper mode=${config.mode} headless=${config.headless}`);
  const browser = await chromium.launch({ headless: config.headless });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  try {
    await login(page, config);
    if (config.mode === 'stock' || config.mode === 'all') await scrapeStock(page, config);
    if (config.mode === 'price' || config.mode === 'all') await scrapePrice(page, config);
    logLine('SUCCESS');
  } catch (error) {
    console.error('Error during scraping:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();
