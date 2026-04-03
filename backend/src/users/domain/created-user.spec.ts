import { CreatedUser } from './created-user';

describe('CreatedUser', () => {
  it('should be defined', () => {
    expect(new CreatedUser(1, "", "", "", "", "")).toBeDefined();
  });
});
