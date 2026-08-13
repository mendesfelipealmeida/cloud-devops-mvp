const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createGatewayApp } = require('../src/services/api-gateway/app');

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

test('api gateway returns service catalog', async () => {
  await withServer(createGatewayApp(), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.service, 'api-gateway');
    assert.ok(body.endpoints.includes('POST /orders'));
  });
});
