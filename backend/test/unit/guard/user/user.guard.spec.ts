import { UserGuard } from 'src/guard/user/user.guard';

describe('UserGuard', () => {
  it('should be defined', () => {
    expect(new UserGuard({ verify: jest.fn() } as any)).toBeDefined();
  });
});
