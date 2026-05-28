const cheerio = require('cheerio');

async function testScrape() {
  const twNewsRes = await fetch('https://news.thaiware.com/');
  const twNewsHtml = await twNewsRes.text();
  const $ = cheerio.load(twNewsHtml);

  const items = [];
  // Thaiware uses something like div.news-list or just a list of items
  // Let's print out all h1, h2, h3 text to see what classes they have
  const headers = [];
  $('h1, h2, h3, h4').each((i, el) => {
    headers.push($(el).text().trim().substring(0, 50));
  });
  console.log("Headers:", headers.slice(0, 10));

  // Let's also check tips
  const twTipsRes = await fetch('https://tips.thaiware.com/');
  const twTipsHtml = await twTipsRes.text();
  const $$ = cheerio.load(twTipsHtml);
  const tipHeaders = [];
  $$('h1, h2, h3, h4').each((i, el) => {
    tipHeaders.push($$(el).text().trim().substring(0, 50));
  });
  console.log("Tips Headers:", tipHeaders.slice(0, 10));

}

testScrape();
