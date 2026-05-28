const cheerio = require('cheerio');
async function run() {
  const res = await fetch('https://www.advice.co.th/product/search?keyword=A0182622');
  const html = await res.text();
  const $ = cheerio.load(html);
  const price = $('.price-sal, .price, .product-price, [class*=price]').first().text();
  console.log('Found price:', price.trim());
}
run();
