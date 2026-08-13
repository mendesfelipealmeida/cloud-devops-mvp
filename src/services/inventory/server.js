const { config } = require('../../common/config');
const { createInventoryApp } = require('./app');

createInventoryApp().listen(config.inventory.port, () => {
  console.log(`Inventory Service rodando em http://localhost:${config.inventory.port}`);
});
