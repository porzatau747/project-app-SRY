import { prisma } from '@repo/database';

async function main() {
  console.log('Starting scraping worker...');
  
  try {
    // Insert mock scraping data into InventoryItem
    const mockData = {
      code: `SCRAPED-${Date.now()}`,
      product: 'Mock Scraped Product',
      qty: Math.floor(Math.random() * 100),
      cost: 10.5,
      sellPrice: 20.0,
      itemType: 'Scraped',
      agingDays: 0,
    };

    console.log('Inserting mock data:', mockData);
    
    await prisma.inventoryItem.create({
      data: mockData,
    });
    
    console.log('Successfully inserted mock scraping data.');
  } catch (error) {
    console.error('Error running scraping worker:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Scraping worker finished.');
  }
}

main().catch(console.error);
