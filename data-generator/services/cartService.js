class CartService {
  constructor (pgClient) {
    pgClient.connect()
    this.pgClient = pgClient
  }

  async deleteCarts() {
    return await this.pgClient.query('DELETE FROM carts WHERE true')
  }

  async deleteCartItems() {
    return await this.pgClient.query('DELETE FROM cart_items WHERE true')
  }

  async saveCarts(carts) {
    let i = 0
    let cart
    for (i = 0; i < carts.length; i++) {
      cart = carts[i]
      try {
        const sql = 'INSERT INTO carts(id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4)'
        const values = [cart.id, cart.user_id, cart.created_at, cart.created_at]
        console.log(values)
        const saveResult = await this.pgClient.query(sql, values)
        console.log(`Saved cart: ${cart.id}`)
      } catch (e) {
        console.log(e.message)
      }
    }
  }

  async saveCartItems(cartItems) {
    let i = 0
    let cartItem
    for (i = 0; i < cartItems.length; i++) {
      cartItem = cartItems[i]
      try {
        const sql = 'INSERT INTO cart_items(cart_id, product_id, count) VALUES ($1, $2, $3)'
        const values = [cartItem.cart_id, cartItem.product_id, cartItem.count]
        console.log(values)
        const saveResult = await this.pgClient.query(sql, values)
        console.log(`Saved cart item: ${cartItem.cart_id}`)
      } catch (e) {
        console.log(e.message)
      }
    }
  }
}

export { CartService }
