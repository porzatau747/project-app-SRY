import asyncio
import json
from playwright.async_api import async_playwright

urls = [
    "https://www.facebook.com/comcraft.ds?locale=th_TH",
    "https://www.facebook.com/ExtremeITReview",
    "https://www.facebook.com/notebookspec",
    "https://www.facebook.com/overclockzonefanpage",
    "https://www.facebook.com/CPUCore2Duo"
]

async def scrape_fb():
    results = {}
    async with async_playwright() as p:
        # Launch Chromium headless
        browser = await p.chromium.launch(headless=True)
        # Use a real user agent to prevent instant blocking
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
            locale="th-TH"
        )
        page = await context.new_page()
        
        for url in urls:
            try:
                print(f"\n[*] Navigating to {url} ...")
                # Go to page and wait for it to load
                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                # Wait 5 seconds to let Facebook's React components render
                await page.wait_for_timeout(5000)
                
                # Extract basic info
                title = await page.title()
                
                # Get all H1 tags (usually contains the page name)
                h1_texts = await page.locator("h1").all_inner_texts()
                
                # Get the main text content, truncating to avoid massive logs
                # We look for div with role="main" or just fallback to body text
                main_content_loc = page.locator("div[role='main']")
                if await main_content_loc.count() > 0:
                    body_text = await main_content_loc.first.inner_text()
                else:
                    body_text = await page.locator("body").inner_text()
                
                # Clean up and truncate the text
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
        
        # Save to JSON file for later use
        with open("fb_scraping_results.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=4)
        print("\n[*] Scraping complete. Results saved to fb_scraping_results.json")

if __name__ == "__main__":
    asyncio.run(scrape_fb())
