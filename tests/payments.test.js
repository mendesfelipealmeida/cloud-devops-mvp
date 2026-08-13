const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createPaymentsApp } = require('../src/services/payments/app');

async function withServer(app, callback) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('payments service approves valid payment below the limit', async () => {
  await withServer(createPaymentsApp(), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/payments/authorize`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        orderId: 'order-1',
        amount: 100,
        paymentMethod: 'credit_card',
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, true);
    assert.equal(body.payment.approved, true);
  });
});

test('payments service rejects invalid payload', async () => {
  await withServer(createPaymentsApp(), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/payments/authorize`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ amount: -10 }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.status, false);
  });
});
