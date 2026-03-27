import { CheckCredentialsRepositoryImpl } from './check-credentials-repository-impl';
import { PayloadEntity } from '../entities/payload-entity';

describe('CheckCredentialsRepositoryImpl', () => {
  let repo: CheckCredentialsRepositoryImpl;
  let mockConn: any;

  beforeEach(() => {
    mockConn = {
      query: jest.fn(),
    };

    repo = new CheckCredentialsRepositoryImpl(mockConn);
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
          role: 'admin',
        },
      ],
    });

    const result = await repo.checkCredentials('testuser', 'password');

    expect(result).toBeInstanceOf(PayloadEntity);
    expect(result).toEqual(new PayloadEntity(1, 'admin'));

    expect(mockConn.query).toHaveBeenCalledWith(
      'SELECT u.id, r.name FROM "user" u JOIN role r ON r.id = u.roleId WHERE u.username = $1 AND u.password = $2',
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
});
