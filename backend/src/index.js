import buildApp from './app.js';
import { PORT } from './config/env.js';

const app = buildApp();

const start = async () => {
  try {
    await app.listen({port: PORT, host: '0.0.0.0'});
    console.log(`Server is running at http://0.0.0.0:${PORT}`);  
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();