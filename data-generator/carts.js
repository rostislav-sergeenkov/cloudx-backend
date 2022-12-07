import { generateFakeCarts, generateFakeCartItems } from './libs/fakeData.js'
import { CartService } from './services/cartService.js'
import * as dotenv from 'dotenv'
import pkg from 'pg'

dotenv.config()
const { Client } = pkg

const pgConfig = {
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
}

const pgClient = new Client(pgConfig)

const numCarts = 10

const carts = generateFakeCarts(numCarts)
const cartItems = generateFakeCartItems(carts)

const cartService = new CartService(pgClient)

await cartService.deleteCartItems()
await cartService.deleteCarts()
await cartService.saveCarts(carts)
await cartService.saveCartItems(cartItems)
await pgClient.end();
