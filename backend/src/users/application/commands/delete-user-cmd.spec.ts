import { DeleteUserCmd } from './delete-user-cmd';

describe('DeleteUserCmd', () => {
  it('should be defined', () => {
    expect(new DeleteUserCmd(1)).toBeDefined();
  });

  it('should have all properties defined', () => {
    const cmd = new DeleteUserCmd(1);

    expect(cmd).toMatchObject({
      id: 1
    });
  });
});
