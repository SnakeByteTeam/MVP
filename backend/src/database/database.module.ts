import { Module, Global} from '@nestjs/common';
import { Pool} from 'pg';

export const PG_POOL = Symbol("PG_POOL")

@Global() //rende il modulo disponibile globalmente, una volta importato nell'AppModule non serve reimportarlo in altri moduli
@Module({
    providers: [
        {
            provide: PG_POOL, 
            useFactory:() => {
                const pool = new Pool({
                    connectionString: process.env.PG_CONNECTION_STRING, 
                    max: 10, 
                    idleTimeoutMillis: 3000,
                    connectionTimeoutMillis: 2000
                });

                pool.on('error', (err) =>{
                    console.error("Erron on PostreSQL Pool");
                });

                return pool;
            }
        },
    ],
    exports: [PG_POOL]
})
export class DatabaseModule {}
