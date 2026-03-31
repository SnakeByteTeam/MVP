import { UsersRepositoryImpl } from './users-repository-impl';

describe('UsersRepositoryImpl', () => {
  it('should be defined', () => {
    const conn = { query: jest.fn() };
    expect(new UsersRepositoryImpl(conn)).toBeDefined();
  });
});
