import { CreateUserAdapter } from './create-user-adapter';

describe('CreateUserAdapter', () => {
  it('should be defined', () => {
    const createUserRepository = { createUser: jest.fn() };
    expect(new CreateUserAdapter(createUserRepository)).toBeDefined();
  });
});
