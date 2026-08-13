require('dotenv').config();

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name] || fallback);
  return Number.isFinite(value) ? value : fallback;
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  gateway: {
    port: numberFromEnv('GATEWAY_PORT', 3000),
    ordersUrl: process.env.ORDERS_SERVICE_URL || 'http://localhost:3001',
    paymentsUrl: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3002',
    inventoryUrl: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003',
  },
  orders: {
    port: numberFromEnv('ORDERS_PORT', 3001),
    paymentsUrl: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3002',
    inventoryUrl: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003',
  },
  payments: {
    port: numberFromEnv('PAYMENTS_PORT', 3002),
    approvalLimit: numberFromEnv('PAYMENT_APPROVAL_LIMIT', 5000),
  },
  inventory: {
    port: numberFromEnv('INVENTORY_PORT', 3003),
  },
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: numberFromEnv('POSTGRES_PORT', 5432),
    user: process.env.POSTGRES_USER || 'pedidos',
    password: process.env.POSTGRES_PASSWORD || 'pedidos',
    database: process.env.POSTGRES_DB || 'pedidos_veloz',
  },
};

module.exports = { config };
