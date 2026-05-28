import asyncio
import json
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

urls = [
    "https://www.facebook.com/comcraft.ds?locale=th_TH"
]

async def scrape_fb():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
            locale="th-TH"
        )
        page = await context.new_page()
        
        for url in urls:
            try:
                print(f"\n[*] Navigating to {url} ...")
                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                await page.wait_for_timeout(5000)
                
                title = await page.title()
                h1_texts = await page.locator("h1").all_inner_texts()
                
                main_content_loc = page.locator("div[role='main']")
                if await main_content_loc.count() > 0:
                    body_text = await main_content_loc.first.inner_text()
                else:
                    body_text = await page.locator("body").inner_text()
                
                body_text = " ".join(body_text.split())
                snippet = body_text[:500] + "..." if len(body_text) > 500 else body_text
                
                results[url] = {
                    "title": title,
                    "h1": [h for h in h1_texts if h.strip()],
                    "snippet": snippet
                }
                
                print(f"[+] Title: {title}")
                print(f"[+] H1: {results[url]['h1']}")
                print(f"[+] Content Snippet: {snippet[:150]}...")
                
            except Exception as e:
                print(f"[-] Error scraping {url}: {e}")
                results[url] = {"error": str(e)}
                
        await browser.close()
        
        with open("fb_scraping_results_comcraft.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=4)
        print("\n[*] Scraping complete.")

if __name__ == "__main__":
    asyncio.run(scrape_fb())
