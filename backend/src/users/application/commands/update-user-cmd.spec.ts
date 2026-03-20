import { UpdateUserCmd } from './update-user-cmd';

describe('UpdateUserCmd', () => {
  it('should be defined', () => {
    expect(new UpdateUserCmd(1, '', '', '')).toBeDefined();
  });

  it('should have all properties defined', () => {
    const cmd = new UpdateUserCmd(1, 'u', 's', 'n');

    expect(cmd).toMatchObject({
      id: 1,
      username: 'u',
      surname: 's',
      name: 'n'
    });
  });
});
