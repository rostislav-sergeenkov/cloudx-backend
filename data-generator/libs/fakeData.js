import { faker } from '@faker-js/faker'

const generateFakeProducts = (numProducts) => {
  const generatedProducts = []
  for (let i = 0; i < numProducts; i++) {
    generatedProducts.push({
      id: faker.datatype.uuid(),
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseInt(faker.commerce.price(10, 100, 0))
    })
  }
  return generatedProducts
}

const generateFakeStocks = (products) => {
  return products.map((productItem) => {
    return {
      product_id: productItem.id,
      count: faker.datatype.number({ 'min': 0, 'max': 100 })
    }
  })
}

const generateFakeCarts = (numCarts) => {
  const generatedCarts = []
  for (let i = 0; i < numCarts; i++) {
    /** @var Date createdAt */
    const createdAt = faker.date.between('2020-01-01T00:00:00.000Z', '2022-11-01T00:00:00.000Z')
    const updatedAt = faker.date.between(createdAt, '2022-11-01T00:00:00.000Z')
    generatedCarts.push({
      id: faker.datatype.uuid(),
      user_id: faker.datatype.uuid(),
      created_at: createdAt.toISOString().slice(0, 10),
      updated_at: updatedAt.toISOString().slice(0, 10),
    })
  }
  return generatedCarts
}

const generateFakeCartItems = (carts) => {
  return carts.map((cartItem) => {
    return {
      cart_id: cartItem.id,
      product_id: faker.datatype.uuid(),
      count: faker.datatype.number({ 'min': 0, 'max': 100 })
    }
  })
}

export { generateFakeProducts, generateFakeStocks, generateFakeCarts, generateFakeCartItems }
