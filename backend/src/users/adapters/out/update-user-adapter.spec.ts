import { UpdateUserAdapter } from './update-user-adapter';

describe('UpdateUserAdapter', () => {
  it('should be defined', () => {
    const updateUserRepository = { updateUser: jest.fn() };
    expect(new UpdateUserAdapter(updateUserRepository)).toBeDefined();
  });
});
