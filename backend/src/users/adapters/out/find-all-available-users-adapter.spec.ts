import { FindAllAvailableUsersAdapter } from './find-all-available-users-adapter';

describe('FindAllAvailableUsersAdapter', () => {
  it('should be defined', () => {
    const findAllAvailableUsersRepository = { findAllAvailableUsers: jest.fn() };
    expect(
      new FindAllAvailableUsersAdapter(findAllAvailableUsersRepository),
    ).toBeDefined();
  });
});
