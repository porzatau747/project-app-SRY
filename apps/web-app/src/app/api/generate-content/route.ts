import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const { template, prompt, imageLayout, freeGift, videoTopic, videoBrief } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY in environment variables.");
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const openai = new OpenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    });

    let systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการสร้างคอนเทนต์ไอทีและการตลาดสำหรับร้าน Advice สามร้อยยอด 
เขียนคอนเทนต์ภาษาไทยแบบเป็นกันเอง อ่านง่าย น่าสนใจ และเป็นประโยชน์`;

    // Load MD files function
    const loadMarkdown = async (filename: string) => {
      try {
        const filePath = path.join(process.cwd(), "src", "prompts", filename);
        return await fs.readFile(filePath, "utf-8");
      } catch (err) {
        console.error("Error reading markdown file:", err);
        return ""; // Fallback
      }
    };

    if (template === "free-text") {
      systemPrompt += `\nคำสั่งจากผู้ใช้งาน: ${prompt}`;
    } else if (template === "ทิปส์ไอที") {
      const designGuide = await loadMarkdown("AI-Content-Design.md");
      const targetLayout = imageLayout === "album5" ? "IT TIPS 5P หรือ Series IT tips 5P" : "IT TIPS 1P";
      
      systemPrompt += `\nคุณต้องสร้างโครงสร้าง Prompt สำหรับนำไปป้อนให้ AI "ChatGPT Images 2.0 (DALL-E 3)" วาดภาพต่อ โดยอ้างอิงจากหัวข้อ: ${prompt} 
      บังคับให้แสดงผลลัพธ์เป็น JSON format เท่านั้น ห้ามมีข้อความอื่นปน โดยใช้โครงสร้างดังนี้:
      {
        "intro": "สร้างภาพคอนเทนต์แนว ทิปส์ไอที สไตล์ตามเทรนไอทีในปัจจุบัน เพื่อใช้โพสลงเพจร้านขายสินค้าไอทีชื่อ Advice สามร้อยยอด โดยใช้ข้อมูลทั้งหมดนี้:",
        "topic": "(คิดหัวข้อน่าสนใจ)",
        "painPoint": "(ปัญหาที่ผู้ใช้เจอ)",
        "insight": "(ข้อมูลเชิงลึกทางเทคนิคแบบเข้าใจง่าย)",
        "bridgeContent": {
          "meme": "(คำคมตลกๆ)",
          "useful": "(วิธีแก้ปัญหา)",
          "product": "(บริการ/สินค้าของร้าน Advice สามร้อยยอด ที่ช่วยแก้ปัญหาได้)"
        },
        "hook": "(ประโยคดึงดูดความสนใจ)",
        "memeAngle": "(อธิบายมุกตลกสำหรับภาพ)",
        "contentBreakdown": "(แบ่งเปรียบเทียบหรืออธิบาย)",
        "visualDirection": "(อ้างอิง Visual Direction และ Style จากเอกสาร Design Guidelines รูปแบบ ${targetLayout})",
        "layout": "(อ้างอิง Layout จากเอกสาร Design Guidelines รูปแบบ ${targetLayout})",
        "imagePrompts": [
          "(อธิบายภาพแต่ละช่อง/ส่วนประกอบตาม Layout ใน Design Guidelines)"
        ]
      }
      \nเอกสารอ้างอิงการออกแบบ (Design Guidelines):\n${designGuide}`;
    } else if (template === "product-a-notebook" || template === "stock-product-a") {
      const designGuide = await loadMarkdown("Stock-Design.md");
      let notebookPrompt = prompt;
      if (freeGift) {
        notebookPrompt += `\nพร้อมของแถม: ${freeGift}`;
      }
      systemPrompt += `\nคุณต้องสร้างโครงสร้าง Prompt สำหรับนำไปป้อนให้ AI "ChatGPT Images 2.0 (DALL-E 3)" วาดภาพต่อ โดยอ้างอิงจากข้อมูลสินค้า: ${notebookPrompt} 
      บังคับให้แสดงผลลัพธ์เป็น JSON format เท่านั้น ห้ามมีข้อความอื่นปน โดยใช้โครงสร้างดังนี้:
      {
        "intro": "สร้างภาพโปรโมทโน้ตบุ๊กแบบพรีเมียม (Product A - Notebook) สไตล์โปสเตอร์สำหรับโพสลงเพจร้านขายสินค้าไอทีชื่อ Advice สามร้อยยอด โดยใช้ข้อมูลทั้งหมดนี้:",
        "topic": "(หัวข้อโปรโมชัน เช่น 'โน้ตบุ๊กเข้าใหม่ 3 เครื่อง')",
        "subTopic": "(สโลแกนเสริม เช่น 'สเปคแรง คุ้มค่า พร้อมลุยทุกงาน')",
        "productShowcase": [
          "(รุ่นที่ 1 พร้อมจุดเด่น สเปค ราคาลด และของแถม 2 รายการ)",
          "(รุ่นที่ 2 พร้อมจุดเด่น สเปค ราคาลด และของแถม 2 รายการ)",
          "(รุ่นที่ 3 พร้อมจุดเด่น สเปค ราคาลด และของแถม 2 รายการ)"
        ],
        "visualDirection": "(อ้างอิงจากหมวด 1.1 Notebook ใน Design Guidelines)",
        "layout": "(อ้างอิงจากหมวด 1.1 Notebook ใน Design Guidelines)",
        "imagePrompts": [
          "(อ้างอิงรายละเอียดส่วนบน ส่วนกลาง ส่วนล่าง จากหมวด 1.1 Notebook)"
        ]
      }
      \nเอกสารอ้างอิงการออกแบบ (Design Guidelines):\n${designGuide}`;
    } else if (template === "product-a-chair") {
      const designGuide = await loadMarkdown("Stock-Design.md");
      systemPrompt += `\nคุณต้องสร้างโครงสร้าง Prompt สำหรับนำไปป้อนให้ AI "ChatGPT Images 2.0 (DALL-E 3)" วาดภาพต่อ โดยอ้างอิงจากข้อมูลสินค้า: ${prompt} 
      บังคับให้แสดงผลลัพธ์เป็น JSON format เท่านั้น ห้ามมีข้อความอื่นปน โดยใช้โครงสร้างดังนี้:
      {
        "intro": "สร้างภาพโปรโมทเก้าอี้เกมมิ่ง (Product A - Gaming Chair) สไตล์โปสเตอร์สำหรับโพสลงเพจร้านขายสินค้าไอทีชื่อ Advice สามร้อยยอด โดยใช้ข้อมูลทั้งหมดนี้:",
        "topic": "(พาดหัวเกี่ยวกับการนั่งเล่นเกมนานๆ ความนุ่มสบาย หรือการอัพเกรดสเตชั่นเกมมิ่ง)",
        "features": [
          "(จุดเด่นที่ 1 เช่น วัสดุเบาะ)",
          "(จุดเด่นที่ 2 เช่น การรองรับสรีระ)",
          "(จุดเด่นที่ 3 เช่น การรับน้ำหนัก)"
        ],
        "targetAudience": "(ระบุกลุ่มเป้าหมาย เช่น สายสตรีมเมอร์, สายเกมเมอร์ระดับโปร)",
        "priceTag": "(ราคาพิเศษ และราคาปกติ)",
        "visualDirection": "(อ้างอิงจากหมวด 1.2 Chair ใน Design Guidelines)",
        "layout": "(อ้างอิงจากหมวด 1.2 Chair ใน Design Guidelines)",
        "imagePrompts": [
          "(อ้างอิงรายละเอียดองค์ประกอบภาพจากหมวด 1.2 Chair)"
        ]
      }
      \nเอกสารอ้างอิงการออกแบบ (Design Guidelines):\n${designGuide}`;
    } else if (template === "product-a-gaming") {
      const designGuide = await loadMarkdown("Stock-Design.md");
      systemPrompt += `\nคุณต้องสร้างโครงสร้าง Prompt สำหรับนำไปป้อนให้ AI "ChatGPT Images 2.0 (DALL-E 3)" วาดภาพต่อ โดยอ้างอิงจากข้อมูลสินค้า: ${prompt} 
      บังคับให้แสดงผลลัพธ์เป็น JSON format เท่านั้น ห้ามมีข้อความอื่นปน โดยใช้โครงสร้างดังนี้:
      {
        "intro": "สร้างภาพโปรโมทเกมมิ่งเกียร์ (Product A - Gaming) สไตล์โปสเตอร์สำหรับโพสลงเพจร้านขายสินค้าไอทีชื่อ Advice สามร้อยยอด โดยใช้ข้อมูลทั้งหมดนี้:",
        "topic": "(พาดหัวโชว์ความโปร หรือตัวจบสายไร้สาย)",
        "productName": "(ชื่อรุ่นสินค้าขนาดใหญ่เด่นชัด)",
        "mainFeatures": "(ฟีเจอร์หลักตัวใหญ่ เช่น FULL SIZE WIRELESS)",
        "specs": [
          "(สเปค 1 เช่น ชนิดสวิตช์)",
          "(สเปค 2 เช่น ไฟ RGB)",
          "(สเปค 3 เช่น แบตเตอรี่)"
        ],
        "priceTag": "(ราคาพิเศษตัวใหญ่ๆสะดุดตา และราคาปกติขีดทิ้ง)",
        "memeAngle": "(คิดมุกตลกหรือมีมไวรัลที่เข้ากับเกมเมอร์ เพื่อนำมาแทรกเป็นเพียงองค์ประกอบเล็กๆ ในมุมใดมุมหนึ่งของภาพ)",
        "visualDirection": "(อ้างอิงจากหมวด 1.3 Gaming Gear ใน Design Guidelines โดยเน้นสินค้าหลักให้ใหญ่และเด่นชัดที่สุด)",
        "layout": "(อ้างอิงจากหมวด 1.3 Gaming Gear ใน Design Guidelines โดยให้ Meme เป็นแค่กิมมิคเล็กๆ ประกอบฉากเท่านั้น)",
        "imagePrompts": [
          "(อ้างอิงรายละเอียดองค์ประกอบภาพจากหมวด 1.3 Gaming Gear และสั่งให้ AI วาด Meme ตามที่คิดไว้ใน memeAngle แทรกเข้าไปเป็นแค่ส่วนประกอบเล็กๆ ไม่แย่งซีนสินค้าหลัก)"
        ]
      }
      \nเอกสารอ้างอิงการออกแบบ (Design Guidelines):\n${designGuide}`;
    } else if (template === "product-a-printer") {
      const designGuide = await loadMarkdown("Stock-Design.md");
      systemPrompt += `\nคุณต้องสร้างโครงสร้าง Prompt สำหรับนำไปป้อนให้ AI "ChatGPT Images 2.0 (DALL-E 3)" วาดภาพต่อ โดยอ้างอิงจากข้อมูลสินค้า: ${prompt} 
      บังคับให้แสดงผลลัพธ์เป็น JSON format เท่านั้น ห้ามมีข้อความอื่นปน โดยใช้โครงสร้างดังนี้:
      {
        "intro": "สร้างภาพโปรโมทเครื่องปริ้นเตอร์ (Product A - Printer) สไตล์โปสเตอร์สำหรับโพสลงเพจร้านขายสินค้าไอทีชื่อ Advice สามร้อยยอด โดยใช้ข้อมูลทั้งหมดนี้:",
        "topic": "(พาดหัวเน้นความคุ้มค่า เช่น 'งานเยอะ งบไม่เยอะ ต้องเจอเครื่องนี้!')",
        "productName": "(ชื่อรุ่นเครื่องปริ้นเตอร์)",
        "features": [
          "(จุดเด่น 1)",
          "(จุดเด่น 2)",
          "(จุดเด่น 3)"
        ],
        "freeGift": "(ของแถมชิ้นใหญ่มาก เช่น กระเป๋าเดินทาง 20 นิ้ว พร้อมระบุมูลค่า)",
        "priceTag": "(ราคาพิเศษ และราคาปกติ)",
        "visualDirection": "(อ้างอิงจากหมวด 1.4 Printer ใน Design Guidelines)",
        "layout": "(อ้างอิงจากหมวด 1.4 Printer ใน Design Guidelines)",
        "imagePrompts": [
          "(อ้างอิงรายละเอียดองค์ประกอบภาพจากหมวด 1.4 Printer)"
        ]
      }
      \nเอกสารอ้างอิงการออกแบบ (Design Guidelines):\n${designGuide}`;
    } else if (template === "product-a-speaker") {
      const designGuide = await loadMarkdown("Stock-Design.md");
      systemPrompt += `\nคุณต้องสร้างโครงสร้าง Prompt สำหรับนำไปป้อนให้ AI "ChatGPT Images 2.0 (DALL-E 3)" วาดภาพต่อ โดยอ้างอิงจากข้อมูลสินค้า: ${prompt} 
      บังคับให้แสดงผลลัพธ์เป็น JSON format เท่านั้น ห้ามมีข้อความอื่นปน โดยใช้โครงสร้างดังนี้:
      {
        "intro": "สร้างภาพโปรโมทลำโพงแต่งโต๊ะคอม (Product A - Speaker) สไตล์โปสเตอร์สำหรับโพสลงเพจร้านขายสินค้าไอทีชื่อ Advice สามร้อยยอด โดยใช้ข้อมูลทั้งหมดนี้:",
        "topic": "(พาดหัวแนวจัดโต๊ะคอม/มินิมอล เช่น 'โต๊ะมินิมอลแล้ว... เสียงต้องไม่กาก')",
        "productName": "(ชื่อรุ่นลำโพง)",
        "features": [
          "(จุดเด่น 1)",
          "(จุดเด่น 2)",
          "(จุดเด่น 3)"
        ],
        "lifestyleConcept": "มีรูปการจัดโต๊ะคอมพิวเตอร์ที่ดูสวยงาม มินิมอล เพื่อเป็นแรงบันดาลใจ",
        "priceTag": "(ราคาโปรโมชัน)",
        "visualDirection": "(อ้างอิงจากหมวด 1.5 Speaker ใน Design Guidelines)",
        "layout": "(อ้างอิงจากหมวด 1.5 Speaker ใน Design Guidelines)",
        "imagePrompts": [
          "(อ้างอิงรายละเอียดองค์ประกอบภาพจากหมวด 1.5 Speaker)"
        ]
      }
      \nเอกสารอ้างอิงการออกแบบ (Design Guidelines):\n${designGuide}`;
    } else if (template === "stock-product-b") {
      const designGuide = await loadMarkdown("Stock-Design.md");
      systemPrompt += `\nคุณต้องสร้างโครงสร้าง Prompt สำหรับนำไปป้อนให้ AI "ChatGPT Images 2.0 (DALL-E 3)" วาดภาพต่อ โดยอ้างอิงจากข้อมูลสินค้า: ${prompt} 
      บังคับให้แสดงผลลัพธ์เป็น JSON format เท่านั้น ห้ามมีข้อความอื่นปน โดยใช้โครงสร้างดังนี้:
      {
        "intro": "สร้างภาพโปรโมทสินค้าจัดรายการ/ลดราคา (Product B) สไตล์โปสเตอร์ Clearance สำหรับโพสลงเพจร้านขายสินค้าไอทีชื่อ Advice สามร้อยยอด โดยใช้ข้อมูลทั้งหมดนี้:",
        "topic": "(หัวข้อโปรโมชัน เช่น 'ลดแรง คุ้มที่สุดตอนนี้' หรือ 'Clearance Sale')",
        "productName": "(ชื่อและรุ่นของสินค้าอย่างชัดเจน)",
        "features": "(จุดเด่นสำคัญ 3-4 ข้อแบบสรุปกระชับ)",
        "priceTag": "(ราคาพิเศษตัวใหญ่ๆ และราคาปกติที่ถูกขีดฆ่า)",
        "visualDirection": "(อ้างอิงจากหมวด 2. Product B ใน Design Guidelines)",
        "layout": "(อ้างอิงจากหมวด 2. Product B ใน Design Guidelines)",
        "imagePrompts": [
          "(อ้างอิงรายละเอียดองค์ประกอบภาพจากหมวด 2. Product B)"
        ]
      }
      \nเอกสารอ้างอิงการออกแบบ (Design Guidelines):\n${designGuide}`;
    } else if (template === "stock-product-b-general") {
      const designGuide = await loadMarkdown("Stock-Design.md");
      systemPrompt += `\nคุณต้องสร้างโครงสร้าง Prompt สำหรับนำไปป้อนให้ AI "ChatGPT Images 2.0 (DALL-E 3)" วาดภาพต่อ โดยอ้างอิงจากข้อมูลสินค้า: ${prompt} 
      บังคับให้แสดงผลลัพธ์เป็น JSON format เท่านั้น ห้ามมีข้อความอื่นปน โดยใช้โครงสร้างดังนี้:
      {
        "intro": "สร้างภาพโปรโมทสินค้าทั่วไป (Product B) สไตล์โปสเตอร์สำหรับโพสลงเพจร้านขายสินค้าไอทีชื่อ Advice สามร้อยยอด โดยใช้ข้อมูลทั้งหมดนี้:",
        "topic": "(หัวข้อแนะนำสินค้าที่น่าสนใจ ดึงดูดความสนใจ โดยห้ามใช้คำว่า Clearance หรือ Sale เด็ดขาด)",
        "productName": "(ชื่อและรุ่นของสินค้าอย่างชัดเจน)",
        "features": "(จุดเด่นสำคัญ 3-4 ข้อแบบสรุปกระชับ)",
        "priceTag": "(ราคาขายปกติ หรือราคาพิเศษถ้ามี)",
        "visualDirection": "(อ้างอิงจากหมวด 2. Product B ใน Design Guidelines เน้นความพรีเมียม ห้ามมี Meme Angle หรือมุกตลกเด็ดขาด และห้ามมีคำว่า Clearance หรือ Sale เด็ดขาด)",
        "layout": "(อ้างอิงจากหมวด 2. Product B ใน Design Guidelines แบบสวยงามเป็นทางการ ห้ามใส่ Meme Angle เด็ดขาด)",
        "imagePrompts": [
          "(อ้างอิงรายละเอียดองค์ประกอบภาพจากหมวด 2. Product B แต่ห้ามสั่งให้ AI ใส่ข้อความ Clearance หรือ Sale ลงในภาพเด็ดขาด และห้ามมี Meme Angle (มุกตลก/มีม) ประกอบในภาพอย่างเด็ดขาด)"
        ]
      }
      \nเอกสารอ้างอิงการออกแบบ (Design Guidelines):\n${designGuide}`;
    } else if (template === "video-thumbnail") {
      let thumbnailContext = "";
      if (videoTopic) {
        thumbnailContext += `หัวข้อของคอนเทนต์คลิป: ${videoTopic}\n`;
      }
      if (videoBrief) {
        thumbnailContext += `บรีฟภาพ/องค์ประกอบที่ต้องการ: ${videoBrief}\n`;
      }
      if (!thumbnailContext) {
        thumbnailContext = prompt;
      }

      systemPrompt += `\nคุณต้องสร้างโครงสร้าง Prompt สำหรับนำไปป้อนให้ AI "ChatGPT Images 2.0 (DALL-E 3)" วาดภาพต่อ โดยอ้างอิงจากข้อมูลด้านล่างนี้:
${thumbnailContext}
      บังคับให้แสดงผลลัพธ์เป็น JSON format เท่านั้น ห้ามมีข้อความอื่นปน โดยใช้โครงสร้างสไตล์ภาพปกคลิป YouTube ดังนี้:
      {
        "intro": "สร้างภาพปกคลิป (Video Thumbnail) สไตล์ YouTube อัตราส่วน 6:9 สำหรับเพจร้านขายสินค้าไอทีชื่อ Advice สามร้อยยอด โดยใช้ข้อมูลทั้งหมดนี้:",
        "topic": "(พาดหัวโชว์ความโปร น่าตื่นเต้น เป็นตัวหนังสือ 3D ขนาดใหญ่เรืองแสง มีขอบหนา)",
        "productName": "(ชื่อรุ่นสินค้าขนาดใหญ่เด่นชัด วางบนแท่นหรือพื้นหลังไฮเทค)",
        "presenter": "(ระบุให้วาดบุคคล หรือพรีเซนเตอร์ยืนอยู่ฝั่งซ้ายหรือขวา ทำท่าทางชี้ไปที่สินค้าหรือข้อความ)",
        "mainFeatures": "(ฟีเจอร์หลักๆ ที่ลอยอยู่เป็นกล่องข้อความหรือไอคอนรอบๆ สินค้า)",
        "visualDirection": "(โทนสีเข้ม สไตล์ Tech/Cyberpunk มีแสงนีออนจัดจ้าน ฟ้า/ม่วง/แดง ตัดกับพรีเซนเตอร์และสินค้าหลักที่สว่างชัดเจน)",
        "layout": "(การจัดวางแบบ 6:9 แบ่งฝั่งซ้ายขวาหรือบนล่างชัดเจน เช่น พรีเซนเตอร์อยู่ฝั่งนึง สินค้าและข้อความ 3D อยู่อีกฝั่งนึง)",
        "imagePrompts": [
          "(สร้าง Prompt ภาษาอังกฤษแบบเจาะจง สั่งให้ AI วาดภาพปกคลิป 6:9 ตามรายละเอียดข้างต้น บังคับให้มีพรีเซนเตอร์ชี้สินค้า ตัวหนังสือพาดหัว 3D ขนาดใหญ่ และบรรยากาศนีออนล้ำสมัย)"
        ]
      }`;
    } else if (template === "trend-news") {
      let newsDesign = "";
      try {
        const newsDesignPath = path.join(process.cwd(), "../../EXX/EX Post/NEWS-design.md");
        newsDesign = await fs.readFile(newsDesignPath, "utf-8");
      } catch (err) {
        console.error("Error reading NEWS-design.md:", err);
      }

      systemPrompt += `\nคุณต้องสร้างคอนเทนต์สำหรับโพสต์ลงเพจร้านขายสินค้าไอทีชื่อ Advice สามร้อยยอด โดยอ้างอิงจากข้อมูลข่าว: ${prompt}
      
      และคุณต้องสร้างโครงสร้าง Prompt สำหรับนำไปป้อนให้ AI "ChatGPT Images 2.0 (DALL-E 3)" วาดภาพข่าวด้วย
      
      บังคับให้แสดงผลลัพธ์เป็น JSON format เท่านั้น ห้ามมีข้อความอื่นปน โดยใช้โครงสร้างดังนี้:
      {
        "intro": "สร้างคอนเทนต์ข่าวไอที สั้น กระชับ อ่านจบปุ๊บรู้เรื่องปั๊บ มี Hook ดึงดูด",
        "topic": "(พาดหัวข่าวสั้นๆ ดึงดูดความสนใจ)",
        "hook": "(ประโยค Hook เปิดโพสต์ให้น่าติดตาม)",
        "insight": "(สรุปใจความสำคัญของข่าว 2-3 บรรทัดให้เข้าใจง่ายสุดๆ)",
        "bridgeContent": {
          "product": "(โยงเข้าหาสินค้าหรือบริการของ Advice สามร้อยยอดแบบเนียนๆ)"
        },
        "visualDirection": "(อ้างอิงจากหมวด 6. Trend & News Image Style ในเอกสาร NEWS-design กำหนดทิศทางของภาพและสีสัน)",
        "layout": "(เลือกใช้ 60/40 Split Layout หรือ Diagonal/Geometric Overlay จากเอกสาร NEWS-design พร้อมอธิบายการจัดวาง)",
        "imagePrompts": [
          "(สร้าง Prompt ภาษาอังกฤษแบบเจาะจง ให้ AI นำไปใช้วาดภาพประกอบข่าวได้เลย โดยระบุโทนสี สไตล์ และเลย์เอาต์ตามเอกสาร NEWS-design บังคับ: ภาพต้องดูสะอาด ไม่รก ไม่มีข้อความตลก/meme เด็ดขาด และระบุ Aspect Ratio เป็น 4:5 เท่านั้น ตัวอย่างเช่น --ar 4:5)"
        ]
      }
      
      อ้างอิงสไตล์การทำภาพจากเอกสาร NEWS-design ด้านล่างนี้:
      ${newsDesign}`;
    } else if (template === "promotion-combo") {
      let agentPromotion = "";
      try {
        const filePath = path.join(process.cwd(), "../../EXX/AgentPromotion.md");
        agentPromotion = await fs.readFile(filePath, "utf-8");
      } catch (err) {
        console.error("Error reading AgentPromotion.md:", err);
      }
      
      systemPrompt += `\nคุณต้องสร้างคอนเทนต์โปรโมชั่นแบบแลกซื้อ (Promotion Combo) โดยอ้างอิงข้อมูล:
${prompt}

บังคับให้แสดงผลลัพธ์เป็น JSON format เท่านั้น ห้ามมีข้อความอื่นปน โดยใช้โครงสร้างดังนี้:
      {
        "intro": "สร้างคอนเทนต์โปรโมชั่นแลกซื้อสุดคุ้ม สไตล์ร้าน Advice สาขาสามร้อยยอด",
        "topic": "(พาดหัวโปรโมชั่นสั้นๆ ดึงดูดความสนใจ เช่น 'ซื้อ A แลกซื้อ B ในราคาโคตรถูก!')",
        "hook": "(ประโยค Hook เปิดโพสต์ด้วยมีมไวรัล หรือกระแสปัจจุบัน)",
        "contextAndTrend": "(ขยี้ปัญหา + เทรนด์ไอทีที่เกี่ยวข้องกับสินค้าทั้งสองตัว)",
        "promotion": "(อธิบายโปรโมชั่นกระแทกใจคนสามร้อยยอด/คนชนบท เน้นความคุ้มค่า ผ่อนสบาย หรือของแถม)",
        "cta": "(Call to Action พร้อมพิกัดร้านที่ไร่ใหม่)"
      }

อ้างอิงคู่มือ AgentPromotion ด้านล่างนี้อย่างเคร่งครัด:
${agentPromotion}`;
    } else if (template === "โปรโมชัน") {
      let agentPromotion = "";
      let newsDesign = "";
      try {
        const agentPath = path.join(process.cwd(), "../../EXX/AgentPromotion.md");
        agentPromotion = await fs.readFile(agentPath, "utf-8");
        const newsDesignPath = path.join(process.cwd(), "../../EXX/NEWS-design.md");
        newsDesign = await fs.readFile(newsDesignPath, "utf-8");
      } catch (err) {
        console.error("Error reading EXX files:", err);
      }
      
      systemPrompt += `\nประเภทคอนเทนต์: ${template}\nหัวข้อ/สินค้า: ${prompt}
      
คุณต้องสร้างโครงสร้าง Prompt สำหรับนำไปป้อนให้ AI "ChatGPT Images 2.0 (DALL-E 3)" วาดภาพต่อ และสร้างคอนเทนต์โปรโมชั่น/โพสต์ขาย โดยอ้างอิงจากข้อมูลด้านบน

บังคับให้แสดงผลลัพธ์เป็น JSON format เท่านั้น ห้ามมีข้อความอื่นปน โดยใช้โครงสร้างดังนี้:
      {
        "intro": "สร้างภาพคอนเทนต์โปรโมชั่นขายสินค้า สไตล์โปสเตอร์สำหรับโพสลงเพจร้านขายสินค้าไอทีชื่อ Advice สามร้อยยอด",
        "topic": "(พาดหัวโปรโมชั่นสั้นๆ ดึงดูดความสนใจ หรือชูจุดเด่น)",
        "hook": "(ประโยค Hook เปิดโพสต์ด้วยมีมไวรัล หรือกระแสปัจจุบัน)",
        "contextAndTrend": "(ขยี้ปัญหา + เทรนด์ไอทีที่เกี่ยวข้องกับสินค้า)",
        "promotion": "(อธิบายโปรโมชั่นกระแทกใจคนสามร้อยยอด/คนชนบท เน้นความคุ้มค่า ผ่อนสบาย หรือของแถม)",
        "cta": "(Call to Action พร้อมพิกัดร้านที่ไร่ใหม่)",
        "visualDirection": "(อ้างอิง Visual Direction จากเอกสาร NEWS-design)",
        "layout": "(อ้างอิง Layout จากเอกสาร NEWS-design)",
        "imagePrompts": [
          "(อธิบายภาพโปรโมชั่น 1 ภาพแบบเจาะจง ให้ AI วาดตามได้เลย โชว์สินค้าเด่นชัด และมีพื้นที่สำหรับใส่ข้อความโปรโมชั่น)"
        ]
      }

อ้างอิงแนวทางการเขียนคอนเทนต์ (Content Style) จากคู่มือ AgentPromotion ด้านล่างนี้อย่างเคร่งครัด:
${agentPromotion}

อ้างอิงแนวทางการออกแบบภาพ (Visual & Layout Style) จากเอกสาร NEWS-design ด้านล่างนี้อย่างเคร่งครัด:
${newsDesign}`;
    } else {
      systemPrompt += `\nประเภทคอนเทนต์: ${template}\nหัวข้อ/สินค้า: ${prompt}\nความยาวไม่เกิน 150 คำ`;
    }

    const response = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [{ role: "user", content: systemPrompt }],
      temperature: 0.7,
    });
    
    return NextResponse.json({ result: response.choices[0].message.content });
  } catch (error: unknown) {
    console.error("Gemini generation error:", error);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
