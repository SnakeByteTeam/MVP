import { UserGuard } from './user.guard';

describe('UserGuard', () => {
  it('should be defined', () => {
    expect(new UserGuard({ verify: jest.fn() } as any)).toBeDefined();
  });
});
