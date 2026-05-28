const cheerio = require('cheerio');

async function testScrape() {
  try {
    console.log('Fetching Thaiware News...');
    const twNewsRes = await fetch('https://news.thaiware.com/');
    const twNewsHtml = await twNewsRes.text();
    const $1 = cheerio.load(twNewsHtml);
    const twNewsItems = [];
    $1('.news-item, .box-news, article').each((i, el) => {
      // Trying generic selectors, or look at typical thaiware structure
      const title = $1(el).find('h2, h3, .title').text().trim();
      const link = $1(el).find('a').attr('href');
      if (title && link) {
        twNewsItems.push({ title, link });
      }
    });
    console.log('Thaiware News items:', twNewsItems.slice(0, 3));

    console.log('\nFetching Line Today Tips...');
    const lineRes = await fetch('https://today.line.me/th/v3/page/ittips');
    const lineHtml = await lineRes.text();
    const $2 = cheerio.load(lineHtml);
    const lineItems = [];
    $2('script').each((i, el) => {
      const text = $2(el).html();
      if (text && text.includes('window.__INITIAL_STATE__')) {
        console.log('Found INITIAL_STATE');
      }
    });
    // Just grab all a tags with title
    $2('a').each((i, el) => {
      const title = $2(el).text().trim();
      if (title && title.length > 20) {
        lineItems.push(title);
      }
    });
    console.log('Line Today items found by simple a tags:', lineItems.slice(0, 5));

  } catch (e) {
    console.error('Error:', e);
  }
}

testScrape();
