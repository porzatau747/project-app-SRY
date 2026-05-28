import Parser from "rss-parser";

const parser = new Parser();

async function checkFeed(name: string, url: string) {
  console.log(`\n--- Fetching ${name} ---`);
  try {
    const res = await fetch(url);
    const xml = await res.text();
    console.log(`${name} XML length: ${xml.length} characters`);
    
    // Write out the raw XML for inspection
    const fs = require('fs');
    fs.writeFileSync(`./scratch/${name}.xml`, xml);
    console.log(`Saved raw XML to ./scratch/${name}.xml`);

    // Try parsing
    await parser.parseString(xml);
    console.log("Parsed successfully!");
  } catch (err: any) {
    console.log(`Error parsing ${name}: ${err.message}`);
  }
}

async function main() {
  await checkFeed("beartai", "https://www.beartai.com/read-category/it-news/feed");
  await checkFeed("overclockzone", "https://www.overclockzone.com/news/Varietytechnews/feed");
}

main().catch(console.error);
