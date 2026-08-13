const crypto = require('crypto');
const { config } = require('../../common/config');
const {
  createServiceApp,
  errorHandler,
  notFoundHandler,
} = require('../../common/http');

function createPaymentsApp() {
  const app = createServiceApp('payments-service');

  app.post('/payments/authorize', (request, response) => {
    const { orderId, amount, paymentMethod } = request.body || {};
    const numericAmount = Number(amount);

    if (!orderId || !Number.isFinite(numericAmount) || numericAmount <= 0 || !paymentMethod) {
      return response.status(400).json({
        status: false,
        message: 'Informe orderId, amount positivo e paymentMethod.',
      });
    }

    const approved = numericAmount <= config.payments.approvalLimit;

    return response.status(200).json({
      status: true,
      payment: {
        id: crypto.randomUUID(),
        orderId,
        amount: numericAmount,
        paymentMethod,
        approved,
        provider: 'mock-provider',
      },
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createPaymentsApp };
