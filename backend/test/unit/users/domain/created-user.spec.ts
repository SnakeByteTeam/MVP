import { CreatedUser } from 'src/users/domain/created-user';

describe('CreatedUser', () => {
  it('should be defined', () => {
    expect(new CreatedUser(1, '', '', '', '', '')).toBeDefined();
  });
});
