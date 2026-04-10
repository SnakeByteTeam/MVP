import { TestingModuleBuilder } from '@nestjs/testing';
import { PG_POOL } from '../src/database/database.module';

/**
 * Setup helper for e2e tests to mock the database connection.
 * This prevents actual database connection attempts during tests.
 * 
 * Usage in beforeAll:
 * const moduleBuilder = Test.createTestingModule({
 *   imports: [AppModule],
 * });
 * overrideDatabaseForE2E(moduleBuilder);
 * const moduleFixture = await moduleBuilder.compile();
 */
export function overrideDatabaseForE2E(
  builder: TestingModuleBuilder,
): TestingModuleBuilder {
  const mockClient = {
    query: jest.fn().mockResolvedValue({ rows: [] }),
    release: jest.fn().mockResolvedValue(undefined),
    end: jest.fn().mockResolvedValue(undefined),
  };

  const mockPool = {
    query: jest.fn().mockResolvedValue({ rows: [] }),
    connect: jest.fn().mockResolvedValue(mockClient),
    end: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  };

  return builder.overrideProvider(PG_POOL).useValue(mockPool);
}
