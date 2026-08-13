const crypto = require('crypto');
const express = require('express');
const cors = require('cors');

function createServiceApp(serviceName) {
  const app = express();
  const counters = {
    requestsTotal: 0,
    errorsTotal: 0,
  };

  app.use(cors());
  app.use(express.json());
  app.use((request, response, next) => {
    request.requestId = request.header('x-request-id') || crypto.randomUUID();
    response.setHeader('x-request-id', request.requestId);
    counters.requestsTotal += 1;

    const startedAt = Date.now();
    response.on('finish', () => {
      if (response.statusCode >= 500) counters.errorsTotal += 1;
      console.log(JSON.stringify({
        service: serviceName,
        requestId: request.requestId,
        method: request.method,
        path: request.originalUrl,
        status: response.statusCode,
        durationMs: Date.now() - startedAt,
      }));
    });

    next();
  });

  app.get('/health', (request, response) => {
    response.status(200).json({ status: true, service: serviceName });
  });

  app.get('/metrics', (request, response) => {
    response.type('text/plain').send([
      `pedidos_veloz_requests_total{service="${serviceName}"} ${counters.requestsTotal}`,
      `pedidos_veloz_errors_total{service="${serviceName}"} ${counters.errorsTotal}`,
    ].join('\n'));
  });

  return app;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(body.message || `Erro ao chamar ${url}`);
    error.statusCode = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

function notFoundHandler(request, response) {
  response.status(404).json({
    status: false,
    message: 'Rota nao encontrada.',
  });
}

function errorHandler(error, request, response, next) {
  const statusCode = error.statusCode || 500;
  console.error(JSON.stringify({
    requestId: request.requestId,
    message: error.message,
    stack: error.stack,
  }));

  response.status(statusCode).json({
    status: false,
    message: statusCode >= 500 ? 'Erro interno no servidor.' : error.message,
    details: error.body,
  });
}

module.exports = {
  createServiceApp,
  errorHandler,
  fetchJson,
  notFoundHandler,
};
