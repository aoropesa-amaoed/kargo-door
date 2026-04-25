import fp from 'fastify-plugin';
import pg from 'pg';

const { Pool } = pg;

async function dbConnector(fastify, options) {
  const pool = new Pool({
    host: options.host,
    port: options.port,
    database: options.database,
    user: options.user,
    password: options.password,
  });

  try {
    const client = await pool.connect();
    console.log('✓ Database connected successfully');
    client.release();
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
    process.exit(1);
  }

  fastify.decorate('db', pool);

  fastify.addHook('onClose', async () => {
    await pool.end();
  });
}

export default fp(dbConnector);