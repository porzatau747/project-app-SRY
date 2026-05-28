const fs = require('fs');

let data = fs.readFileSync('data/apify_fb_posts.json', 'utf8');

if (data.startsWith('```json')) {
  data = data.replace(/^```json\n/, '');
  data = data.replace(/\n```$/, '');
}

fs.writeFileSync('data/apify_fb_posts.json', data);
console.log('Cleaned JSON!');
