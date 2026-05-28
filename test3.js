const cheerio = require('cheerio');

async function testScrape() {
  const res = await fetch('https://news.thaiware.com/');
  const html = await res.text();
  const $ = cheerio.load(html);

  const items = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.match(/\/\d+\.html$/)) {
      const title = $(el).attr('title') || $(el).text().trim();
      if (title && title.length > 10) {
        let fullLink = href;
        if (href.startsWith('/')) {
            fullLink = 'https://news.thaiware.com' + href;
        }
        items.push({ title, link: fullLink });
      }
    }
  });

  // deduplicate
  const uniqueItems = [];
  const seen = new Set();
  for (const item of items) {
      if (!seen.has(item.link)) {
          seen.add(item.link);
          uniqueItems.push(item);
      }
  }

  console.log("Found links:", uniqueItems.slice(0, 5));
}

testScrape();
