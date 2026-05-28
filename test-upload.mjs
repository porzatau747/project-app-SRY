import fs from 'fs';
import path from 'path';

async function testUpload() {
  try {
    const stockPath = path.resolve('EXX', 'ไฟล์สต็อก.xlsx');
    const pricePath = path.resolve('EXX', 'ไฟล์ราคากลาง.xlsx');

    const stockFile = fs.readFileSync(stockPath);
    const priceFile = fs.readFileSync(pricePath);

    const formData = new FormData();
    formData.append('stockFile', new Blob([stockFile], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'ไฟล์สต็อก.xlsx');
    formData.append('priceFile', new Blob([priceFile], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'ไฟล์ราคากลาง.xlsx');

    console.log('Uploading files to http://localhost:3000/api/analyze-stock ...');
    
    const res = await fetch('http://localhost:3000/api/analyze-stock', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Upload failed:', res.status, text);
      return;
    }

    const data = await res.json();
    console.log('Upload successful! Summary:');
    console.log(`- Total SKU: ${data.summary.totalSku}`);
    console.log(`- Total Value: ${data.summary.totalStockValue}`);
    
    // Now let's test Search Price on the first item
    if (data.inventory && data.inventory.length > 0) {
      const firstItem = data.inventory[0];
      console.log(`Testing search price for ${firstItem.code}...`);
      const priceRes = await fetch('http://localhost:3000/api/search-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemCode: firstItem.code })
      });
      const priceData = await priceRes.json();
      console.log('Search price result status:', priceRes.status);
    }

    console.log('Testing generate post...');
    if (data.inventory && data.inventory.length > 0) {
      const firstItem = data.inventory[0];
      console.log(`Adding post for ${firstItem.code}...`);
      const addRes = await fetch('http://localhost:3000/api/add-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemCode: firstItem.code })
      });
      const addData = await addRes.json();
      console.log('Add post status:', addRes.status);
      
      const newPostId = addData.weeklyPlan[0].id;

      console.log(`Generating content for ${newPostId}...`);
      const postRes = await fetch('http://localhost:3000/api/generate-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: newPostId })
      });
      console.log('Generate post status:', postRes.status);
    }
  } catch (err) {
    console.error('Error during test:', err);
  }
}

testUpload();
