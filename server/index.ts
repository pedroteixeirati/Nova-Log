import app from './app';
import { config } from './config';
import { pool } from './db';

async function start() {
  await pool.query('select 1');
  app.listen(config.port, () => {
    console.log(`API Nova Log escutando na porta ${config.port}`);
  });
}

start().catch((error) => {
  console.error('Falha ao iniciar API:', error);
  process.exit(1);
});
