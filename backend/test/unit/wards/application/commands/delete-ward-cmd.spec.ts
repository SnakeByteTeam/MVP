import { DeleteWardCmd } from 'src/wards/application/commands/delete-ward-cmd';

describe('DeleteWardCmd', () => {
  it('should be defined', () => {
    expect(new DeleteWardCmd(1)).toBeDefined();
  });
});
