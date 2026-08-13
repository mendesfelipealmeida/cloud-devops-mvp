const { config } = require('../../common/config');
const { createPaymentsApp } = require('./app');

createPaymentsApp().listen(config.payments.port, () => {
  console.log(`Payments Service rodando em http://localhost:${config.payments.port}`);
});
