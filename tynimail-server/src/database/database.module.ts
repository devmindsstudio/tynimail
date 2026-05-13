import { Global, Module } from '@nestjs/common';
import knex, { Knex } from 'knex';
import * as path from 'path';

// Resolve knexfile from the server root (process.cwd() = server/ in all envs)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require(path.resolve(process.cwd(), 'knexfile.js'));

const env = process.env.NODE_ENV || 'local';
const dbConnection: Knex = knex(config[env] || config.local);

@Global() // makes the DB available globally without reimporting
@Module({
  providers: [
    {
      provide: 'KNEX_CONNECTION',
      useValue: dbConnection,
    },
  ],
  exports: ['KNEX_CONNECTION'],
})
export class DatabaseModule { }
