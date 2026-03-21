import { Global, Module, Inject } from '@nestjs/common';
import { Pool } from 'pg';

export const PG_POOL = 'PG_POOL';

export const InjectPool = () => Inject(PG_POOL);

@Global() // rende il Pool disponibile in tutta l'app senza re-importare il modulo
@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: () =>
        new Pool({
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT ?? '5432'),
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
        }),
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule {}
