import { FindAllUsersAdapter } from './find-all-users-adapter';

describe('FindAllUsersAdapter', () => {
  it('should be defined', () => {
    const findAllUsersRepository = { findAllUsers: jest.fn() };
    expect(new FindAllUsersAdapter(findAllUsersRepository)).toBeDefined();
  });
});
