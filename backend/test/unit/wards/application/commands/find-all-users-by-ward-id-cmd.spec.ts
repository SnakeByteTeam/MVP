import { FindAllUsersByWardIdCmd } from 'src/wards/application/commands/find-all-users-by-ward-id-cmd';

describe('FindAllUsersByWardIdCmd', () => {
  it('should be defined', () => {
    expect(new FindAllUsersByWardIdCmd(1)).toBeDefined();
  });
});
