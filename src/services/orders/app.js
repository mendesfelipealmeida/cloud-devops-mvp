const crypto = require('crypto');
const { pool } = require('../../common/database');
const { config } = require('../../common/config');
const {
  createServiceApp,
  errorHandler,
  fetchJson,
  notFoundHandler,
} = require('../../common/http');

function createOrdersApp() {
  const app = createServiceApp('orders-service');

  app.get('/orders', async (request, response, next) => {
    try {
      const result = await pool.query(
        `SELECT id, customer_name AS "customerName", product_id AS "productId",
                quantity, total_amount AS "totalAmount", status, created_at AS "createdAt"
         FROM orders
         ORDER BY created_at DESC`
      );

      response.status(200).json({
        status: true,
        orders: result.rows,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/orders', async (request, response, next) => {
    const { customerName, productId, quantity, paymentMethod } = request.body || {};
    const parsedQuantity = Number(quantity);

    if (!customerName || !productId || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0 || !paymentMethod) {
      return response.status(400).json({
        status: false,
        message: 'Informe customerName, productId, quantity inteiro positivo e paymentMethod.',
      });
    }

    try {
      const reservationData = await fetchJson(`${config.orders.inventoryUrl}/inventory/reserve`, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: parsedQuantity }),
        headers: { 'x-request-id': request.requestId },
      });

      const product = reservationData.reservation.product;
      const totalAmount = Number(product.price) * parsedQuantity;
      const orderId = crypto.randomUUID();

      const paymentData = await fetchJson(`${config.orders.paymentsUrl}/payments/authorize`, {
        method: 'POST',
        body: JSON.stringify({ orderId, amount: totalAmount, paymentMethod }),
        headers: { 'x-request-id': request.requestId },
      });

      const status = paymentData.payment.approved ? 'CONFIRMED' : 'PAYMENT_REFUSED';
      const insertResult = await pool.query(
        `INSERT INTO orders (id, customer_name, product_id, quantity, total_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, customer_name AS "customerName", product_id AS "productId",
                   quantity, total_amount AS "totalAmount", status, created_at AS "createdAt"`,
        [orderId, customerName, productId, parsedQuantity, totalAmount, status]
      );

      console.log(JSON.stringify({
        event: 'PedidoCriado',
        requestId: request.requestId,
        orderId,
        status,
      }));

      return response.status(201).json({
        status: true,
        order: insertResult.rows[0],
        payment: paymentData.payment,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createOrdersApp };
