import { AdminGuard } from 'src/guard/admin/admin.guard';

describe('AdminGuard', () => {
  it('should be defined', () => {
    expect(new AdminGuard({ verify: jest.fn() } as any)).toBeDefined();
  });
});
