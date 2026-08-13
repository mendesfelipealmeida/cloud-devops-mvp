const { pool } = require('../../common/database');
const {
  createServiceApp,
  errorHandler,
  notFoundHandler,
} = require('../../common/http');

function createInventoryApp() {
  const app = createServiceApp('inventory-service');

  app.get('/products', async (request, response, next) => {
    try {
      const result = await pool.query(
        `SELECT id, sku, name, price, stock
         FROM products
         ORDER BY name ASC`
      );

      response.status(200).json({
        status: true,
        products: result.rows,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/inventory/reserve', async (request, response, next) => {
    const { productId, quantity } = request.body || {};
    const parsedQuantity = Number(quantity);

    if (!productId || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return response.status(400).json({
        status: false,
        message: 'Informe productId e quantity inteiro positivo.',
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const productResult = await client.query(
        `SELECT id, sku, name, price, stock
         FROM products
         WHERE id = $1
         FOR UPDATE`,
        [productId]
      );

      const product = productResult.rows[0];
      if (!product) {
        await client.query('ROLLBACK');
        return response.status(404).json({
          status: false,
          message: 'Produto nao encontrado.',
        });
      }

      if (product.stock < parsedQuantity) {
        await client.query('ROLLBACK');
        return response.status(409).json({
          status: false,
          message: 'Estoque insuficiente para reservar o produto.',
        });
      }

      const updatedResult = await client.query(
        `UPDATE products
         SET stock = stock - $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, sku, name, price, stock`,
        [parsedQuantity, productId]
      );

      await client.query('COMMIT');

      return response.status(200).json({
        status: true,
        reservation: {
          product: updatedResult.rows[0],
          quantity: parsedQuantity,
        },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      return next(error);
    } finally {
      client.release();
    }
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createInventoryApp };
