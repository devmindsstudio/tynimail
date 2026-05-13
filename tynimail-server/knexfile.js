require('ts-node/register');

const dotenv = require('dotenv');
const path = require('path');

const envPath = {
  development: path.resolve(process.cwd(), '.env.development'),
  production: path.resolve(process.cwd(), '.env.production'),
  staging: path.resolve(process.cwd(), '.env.staging'),
  local: path.resolve(process.cwd(), '.env'),
};

const envFile = envPath[process.env.NODE_ENV] || envPath.development;
const result = dotenv.config({ path: envFile });

if (result.error) {
  console.error(`Error loading env file from: ${envFile}`, result.error);
} else {
  console.log(`Loaded env file from: ${envFile}`);
}

const baseConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'test123',
    database: process.env.DB_NAME || 'nest_knex_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  migrations: {
    directory: './src/database/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './src/database/seeds',
    extension: 'ts',
  },
};

const config = {
  development: baseConfig,
  production: baseConfig,
  staging: baseConfig,
  local: baseConfig,
};

module.exports = config;
