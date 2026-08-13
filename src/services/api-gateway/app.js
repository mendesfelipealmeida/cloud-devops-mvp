const { config } = require('../../common/config');
const {
  createServiceApp,
  errorHandler,
  fetchJson,
  notFoundHandler,
} = require('../../common/http');

function createGatewayApp() {
  const app = createServiceApp('api-gateway');

  app.get('/', (request, response) => {
    response.status(200).json({
      status: true,
      service: 'api-gateway',
      message: 'Pedidos Veloz API Gateway online',
      endpoints: [
        'GET /products',
        'GET /orders',
        'POST /orders',
        'POST /payments/authorize',
      ],
    });
  });

  app.get('/products', async (request, response, next) => {
    try {
      const data = await fetchJson(`${config.gateway.inventoryUrl}/products`, {
        headers: { 'x-request-id': request.requestId },
      });
      response.status(200).json(data);
    } catch (error) {
      next(error);
    }
  });

  app.get('/orders', async (request, response, next) => {
    try {
      const data = await fetchJson(`${config.gateway.ordersUrl}/orders`, {
        headers: { 'x-request-id': request.requestId },
      });
      response.status(200).json(data);
    } catch (error) {
      next(error);
    }
  });

  app.post('/orders', async (request, response, next) => {
    try {
      const data = await fetchJson(`${config.gateway.ordersUrl}/orders`, {
        method: 'POST',
        body: JSON.stringify(request.body),
        headers: { 'x-request-id': request.requestId },
      });
      response.status(201).json(data);
    } catch (error) {
      next(error);
    }
  });

  app.post('/payments/authorize', async (request, response, next) => {
    try {
      const data = await fetchJson(`${config.gateway.paymentsUrl}/payments/authorize`, {
        method: 'POST',
        body: JSON.stringify(request.body),
        headers: { 'x-request-id': request.requestId },
      });
      response.status(200).json(data);
    } catch (error) {
      next(error);
    }
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createGatewayApp };
