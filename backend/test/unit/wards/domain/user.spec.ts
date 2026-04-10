import { User } from 'src/wards/domain/user';

describe('User', () => {
  it('should be defined', () => {
    expect(new User(1, '')).toBeDefined();
  });
});
