import { User } from 'src/users/domain/user';

describe('User', () => {
  it('should be defined', () => {
    expect(new User(1, '', '', '', '')).toBeDefined();
  });
});
