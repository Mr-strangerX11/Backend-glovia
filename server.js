require('dotenv').config();
require('ts-node/register');
require('tsconfig-paths/register');

const { bootstrap } = require('./src/main');

const port = process.env.PORT || 5000;

bootstrap().then(() => {
  console.log(`Glovia Backend API running on port ${port}`);
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
