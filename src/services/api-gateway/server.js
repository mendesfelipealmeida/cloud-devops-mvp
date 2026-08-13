const { config } = require('../../common/config');
const { createGatewayApp } = require('./app');

createGatewayApp().listen(config.gateway.port, () => {
  console.log(`API Gateway rodando em http://localhost:${config.gateway.port}`);
});
