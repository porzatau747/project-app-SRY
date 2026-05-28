import asyncio
import json
import os
import sys
from playwright.async_api import async_playwright

# ตั้งค่าให้รองรับการ print ภาษาไทยใน Windows
sys.stdout.reconfigure(encoding='utf-8')

# ชื่อไฟล์ที่จะใช้เก็บ Cookies และ LocalStorage (สถานะการล็อคอิน)
STATE_FILE = "fb_state.json"

urls = [
    "https://www.facebook.com/comcraft.ds?locale=th_TH",
    "https://www.facebook.com/ExtremeITReview",
    "https://www.facebook.com/notebookspec",
    "https://www.facebook.com/overclockzonefanpage",
    "https://www.facebook.com/CPUCore2Duo"
]

async def login_and_save_state():
    """
    ฟังก์ชันสำหรับเปิดเบราว์เซอร์แบบให้เห็นหน้าต่าง เพื่อให้ผู้ใช้สามารถล็อคอินด้วยตัวเองได้
    จากนั้นจะดึง Session/Cookies ออกมาเซฟเป็นไฟล์เก็บไว้
    """
    print("[*] กำลังเปิดเบราว์เซอร์เพื่อให้คุณล็อคอิน...")
    async with async_playwright() as p:
        # เปิด Headless=False เพื่อให้เห็นหน้าเว็บและล็อคอินได้
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 720},
            locale="th-TH"
        )
        page = await context.new_page()
        await page.goto("https://www.facebook.com/")
        
        print("\n=======================================================")
        print("[!] กรุณาล็อคอินในเบราว์เซอร์ที่เปิดขึ้นมาให้เรียบร้อย")
        print("[!] เมื่อล็อคอินและเข้าสู่หน้า Feed หลักแล้ว ให้กลับมาที่หน้าจอนี้แล้วกด Enter...")
        print("=======================================================\n")
        
        # ใช้ input ของฝั่ง Synchronous ชั่วคราวเพื่อรอผู้ใช้กด Enter
        await asyncio.to_thread(input, "กด Enter เมื่อพร้อม...")
        
        # บันทึกสถานะ (Cookies, LocalStorage)
        await context.storage_state(path=STATE_FILE)
        print(f"\n[*] บันทึก Cookies สำเร็จที่ไฟล์ {STATE_FILE}")
        await browser.close()

async def scrape_with_cookies():
    """
    ฟังก์ชันสำหรับดึงข้อมูล โดยใช้ Cookies ที่เก็บไว้ เพื่อไม่ให้โดนบล็อกและเห็นข้อมูลแบบคนล็อคอิน
    """
    print("\n[*] เริ่มกระบวนการดึงข้อมูลโดยใช้ Cookies...")
    results = {}
    async with async_playwright() as p:
        # โหลด Cookies จากไฟล์
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            storage_state=STATE_FILE, # <--- โหลด Cookies เข้ามาที่นี่
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
                print(f"[+] Content Snippet: {snippet[:150]}...")
                
            except Exception as e:
                print(f"[-] Error scraping {url}: {e}")
                results[url] = {"error": str(e)}
                
        await browser.close()
        
        with open("fb_scraping_results_auth.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=4)
        print("\n[*] Scraping complete. Results saved to fb_scraping_results_auth.json")

async def main():
    # ตรวจสอบว่าเคยเซฟไฟล์ Cookies ไว้หรือยัง
    if not os.path.exists(STATE_FILE):
        print(f"[-] ไม่พบไฟล์ {STATE_FILE} (ยังไม่มี Cookies)")
        await login_and_save_state()
    else:
        print(f"[+] พบไฟล์ {STATE_FILE} แล้ว ข้ามขั้นตอนการล็อคอิน")
        
    # ดึงข้อมูลจาก 5 เพจ
    await scrape_with_cookies()

if __name__ == "__main__":
    asyncio.run(main())
