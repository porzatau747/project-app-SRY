import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://branch.nescen.in.th/', { waitUntil: 'networkidle' });
    await page.fill('#username', '685409');
    await page.fill('#pass', 'Adv@02573');
    await page.click('#loginId');
    
    await page.waitForSelector('#authen-branch option', { state: 'attached', timeout: 10000 }).catch(() => null);
    
    await page.evaluate(() => {
      const select = document.querySelector('#authen-branch') as HTMLSelectElement;
      if (select && select.options.length > 0) {
         (window as any).set_session(select.options[0].value);
      }
    });

    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null);
    await page.waitForTimeout(2000);

    await page.goto('https://branch.nescen.in.th/55000067/index.php/shop/model_price_config', { waitUntil: 'networkidle' });
    
    const html = await page.content();
    require('fs').writeFileSync('price_config.html', html);
    console.log("HTML saved to price_config.html");

  } finally {
    await browser.close();
  }
}
run();
