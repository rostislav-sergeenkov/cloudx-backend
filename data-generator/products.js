import { generateFakeProducts, generateFakeStocks } from './libs/fakeData.js'
import { insertProducts, insertStocks } from './libs/db/dynamoDbBatchWriteItem.js'

const numProducts = 20;
const fakeProducts = generateFakeProducts(numProducts);
const fakeStocks = generateFakeStocks(fakeProducts);
const resultProducts = await insertProducts(fakeProducts);

if (resultProducts) {
  console.log(`Successfully generated ${numProducts} products`);

  const resultStocks = await insertStocks(fakeStocks);

  if (resultStocks) {
    console.log(`Successfully generated ${fakeStocks.length} stocks`);
  }
  else {
    console.log('Failed to generate fake stocks to DB');
  }
}
else {
  console.log('Failed to generate fake products to DB');
}
