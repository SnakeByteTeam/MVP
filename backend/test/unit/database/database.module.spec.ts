import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import { DatabaseModule, PG_POOL } from 'src/database/database.module';

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  })),
}));

describe('DatabaseModule', () => {
  beforeEach(() => {
    process.env.PG_CONNECTION_STRING = 'postgres://user:pwd@localhost:5432/db';
  });

  it('should provide PG pool token', async () => {
    const module = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();

    const pool = module.get(PG_POOL);

    expect(pool).toBeDefined();
    expect(Pool).toHaveBeenCalledTimes(1);
    expect(Pool).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionString: 'postgres://user:pwd@localhost:5432/db',
        max: 10,
      }),
    );
  });
});
