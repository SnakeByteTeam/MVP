import { CredentialsRepositoryImpl } from 'src/auth/infrastructure/persistence/credentials-repository-impl';
import { PayloadEntity } from 'src/auth/infrastructure/entities/payload-entity';

describe('CredentialsRepositoryImpl', () => {
  let repo: CredentialsRepositoryImpl;
  let mockConn: any;

  beforeEach(() => {
    mockConn = {
      query: jest.fn(),
    };

    repo = new CredentialsRepositoryImpl(mockConn);
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });

  it('should return PayloadEntity when user exists', async () => {
    mockConn.query.mockResolvedValue({
      rowCount: 1,
      rows: [
        {
          id: 1,
          username: 'testuser',
          role: 'AMMINISTRATORE',
          first_access: false,
        },
      ],
    });

    const result = await repo.checkCredentials('testuser', 'password');

    expect(result).toBeInstanceOf(PayloadEntity);
    expect(result).toEqual(new PayloadEntity(1, 'testuser', 'AMMINISTRATORE', false));

    expect(mockConn.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM "user" u'),
      ['testuser', 'password'],
    );
  });

  it('should throw error when user not found', async () => {
    mockConn.query.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    await expect(
      repo.checkCredentials('wronguser', 'password'),
    ).rejects.toThrow('User not found');
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
