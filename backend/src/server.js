const app = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/db');

const startServer = async () => {
  try {
    await testConnection();
    app.listen(env.port, () => {
      console.log(`${env.appName} API listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();
