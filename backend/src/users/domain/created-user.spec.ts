import { CreatedUser } from './created-user';

describe('CreatedUser', () => {
  it('should be defined', () => {
    expect(new CreatedUser(1, 'user', 'surname', 'name', 'admin', 'temp')).toBeDefined();
  });
});
