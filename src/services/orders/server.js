const { config } = require('../../common/config');
const { createOrdersApp } = require('./app');

createOrdersApp().listen(config.orders.port, () => {
  console.log(`Orders Service rodando em http://localhost:${config.orders.port}`);
});
