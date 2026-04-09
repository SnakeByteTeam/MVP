import { WardsUsersRelationshipsRepositoryImpl } from './wards-users-relationships-repository-impl';

describe('WardsUsersRelationshipsRepositoryImpl', () => {
  let repo: WardsUsersRelationshipsRepositoryImpl;
  let mockConn: any;

  beforeEach(() => {
    mockConn = {
      query: jest.fn(),
    };
    repo = new WardsUsersRelationshipsRepositoryImpl(mockConn);
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });

  it('should call query with correct parameters when adding a user to a ward', async () => {
    mockConn.query.mockResolvedValue({
      rowCount: 1,
      rows: [{ id: 'id', name: 'plant' }],
    });

    await repo.addUserToWard(1, 1);

    expect(mockConn.query).toHaveBeenCalledWith(
      'WITH inserted AS ( INSERT INTO ward_user (ward_id, user_id) VALUES ($1, $2) RETURNING user_id) SELECT id, username FROM "user" WHERE id = (SELECT user_id FROM inserted)',
      [1, 1],
    );
  });

  it('should return UserEntity when adding a user to a ward', async () => {
    const mockUser = { id: 1, username: 'user' };

    mockConn.query.mockResolvedValue({
      rowCount: 1,
      rows: [mockUser],
    });

    const result = await repo.addUserToWard(1, 1);

    expect(mockConn.query).toHaveBeenCalledWith(
      'WITH inserted AS ( INSERT INTO ward_user (ward_id, user_id) VALUES ($1, $2) RETURNING user_id) SELECT id, username FROM "user" WHERE id = (SELECT user_id FROM inserted)',
      [1, 1],
    );

    expect(result).toEqual(mockUser);
  });

  it('should throw if no user is added to ward', async () => {
    mockConn.query.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    await expect(repo.addUserToWard(1, 1)).rejects.toThrow(
      'Add user to ward failed',
    );
  });

  it('should propagate DB error on add user to ward', async () => {
    mockConn.query.mockRejectedValue(new Error('DB error'));

    await expect(repo.addUserToWard(1, 1)).rejects.toThrow('DB error');
  });

  it('should find all users by ward id', async () => {
    const users = [
      { id: 1, username: 'u1' },
      { id: 2, username: 'u2' },
    ];

    mockConn.query.mockResolvedValue({
      rows: users,
    });

    const result = await repo.findAllUsersByWardId(1);

    expect(mockConn.query).toHaveBeenCalledWith(
      'SELECT u.id, u.username FROM "user" u JOIN ward_user wu ON u.id = wu.user_id WHERE wu.ward_id = $1',
      [1],
    );

    expect(result).toEqual(users);
  });

  it('should propagate DB error on find all users by ward id', async () => {
    mockConn.query.mockRejectedValue(new Error('DB error'));

    await expect(repo.findAllUsersByWardId(1)).rejects.toThrow('DB error');
  });

  it('should call query with correct parameters when removing a user from a ward', async () => {
    await repo.removeUserFromWard(1, 1);

    expect(mockConn.query).toHaveBeenCalledWith(
      'DELETE FROM ward_user WHERE ward_id = $1 AND user_id = $2',
      [1, 1],
    );
  });

  it('should propagate DB error on remove user from ward', async () => {
    mockConn.query.mockRejectedValue(new Error('DB error'));

    await expect(repo.removeUserFromWard(1, 1)).rejects.toThrow('DB error');
  });
});
