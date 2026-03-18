import { CreateUserCmd } from './create-user-cmd';

describe('CreateUserCmd', () => {
  it('should be defined', () => {
    expect(new CreateUserCmd("","","","","")).toBeDefined();
  });

  it('should have all properties defined', () => {
    const cmd = new CreateUserCmd('u', 's', 'n', 'r', 'p');

    expect(cmd).toMatchObject({
      username: 'u',
      surname: 's',
      name: 'n',
      role: 'r',
      tempPassword: 'p',
    });
  });
});
