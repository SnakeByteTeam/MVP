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
          role: 'OPERATORE_SANITARIO',
          first_access: false,
        },
      ],
    });

    const result = await repo.checkCredentials('testuser', 'password');

    expect(result).toBeInstanceOf(PayloadEntity);
    expect(result).toEqual(
      new PayloadEntity(1, 'testuser', 'OPERATORE_SANITARIO', false),
    );

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
});
