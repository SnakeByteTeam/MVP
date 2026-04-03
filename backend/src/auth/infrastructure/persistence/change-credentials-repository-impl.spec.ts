import { ChangeCredentialsRepositoryImpl } from './change-credentials-repository-impl';

describe('ChangeCredentialsRepositoryImpl', () => {
  let repo: ChangeCredentialsRepositoryImpl;
  let mockConn: any;

  beforeEach(() => {
    mockConn = {
      query: jest.fn(),
    };

    repo = new ChangeCredentialsRepositoryImpl(mockConn);
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });

  it('should call query with correct parameters when changing credentials', async () => {
    mockConn.query.mockResolvedValue({});

    await repo.changeCredentials('testuser', 'newPassword', true);

    expect(mockConn.query).toHaveBeenCalledWith(
      'UPDATE "user" SET password = $1, first_access = $2 WHERE username = $3',
      ['newPassword', true, 'testuser'],
    );
  });

  it('should propagate errors from the database', async () => {
    mockConn.query.mockRejectedValue(new Error('DB error'));

    await expect(
      repo.changeCredentials('testuser', 'newPassword', true),
    ).rejects.toThrow('DB error');
  });
});
