import { DeleteUserAdapter } from './delete-user-adapter';

describe('DeleteUserAdapter', () => {
  it('should be defined', () => {
    const deleteUserRepository = { deleteUser: jest.fn() };
    expect(new DeleteUserAdapter(deleteUserRepository)).toBeDefined();
  });
});
