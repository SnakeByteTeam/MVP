import { describe, expect, it } from 'vitest';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  it('consente sempre l accesso', () => {
    const result = adminGuard({} as never, {} as never);

    expect(result).toBe(true);
  });
});