import { UsersRepositoryImpl } from './users-repository-impl';

describe('UsersRepositoryImpl', () => {
  let repo: UsersRepositoryImpl;
  let mockConn: any;

  beforeEach(() => {
    mockConn = {
      query: jest.fn(),
    };
    repo = new UsersRepositoryImpl(mockConn);
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });

  it('should call query with correct parameters when creating a user', async () => {
    mockConn.query.mockResolvedValue({
      rowCount: 1,
      rows: [
        {
          id: 1,
          username: 'username',
          surname: 'surname',
          name: 'name',
          role: 'user',
        },
      ],
    });

    await repo.createUser('username', 'surname', 'name', 'tempPassword');

    expect(mockConn.query).toHaveBeenCalledWith(
      ` WITH operator_role AS ( SELECT id FROM role WHERE name = 'Operatore sanitario' LIMIT 1 ), ` +
        ` created_user AS ( INSERT INTO "user" (username, surname, name, password, temp_password, roleId) SELECT $1, $2, $3, $4, $4, id FROM operator_role RETURNING * ) ` +
        ` SELECT u.id, u.username, u.surname, u.name, r.name AS role FROM created_user u LEFT JOIN role r ON u.roleId = r.id;`,
      ['username', 'surname', 'name', 'tempPassword'],
    );
  });

  it('should throw an error if createUser does not return a row', async () => {
    mockConn.query.mockResolvedValue({ rowCount: 0, rows: [] });

    await expect(
      repo.createUser('username', 'surname', 'name', 'tempPassword'),
    ).rejects.toThrow('Create user not found');
  });

  it('should call query with correct parameters when updating a user', async () => {
    mockConn.query.mockResolvedValue({
      rowCount: 1,
      rows: [
        {
          id: 1,
          username: 'username',
          surname: 'surname',
          name: 'name',
          role: 'user',
        },
      ],
    });

    await repo.updateUser(1, 'username', 'surname', 'name');

    expect(mockConn.query).toHaveBeenCalledWith(
      ' WITH updated_user AS ( UPDATE "user" SET username = $1, surname = $2, name = $3 WHERE id = $4 RETURNING * )' +
        ' SELECT u.id, u.username, u.surname, u.name, u.password, u.temp_password, u.roleId, r.id AS role_id, r.name AS role ' +
        ' FROM updated_user u LEFT JOIN role r ON u.roleId = r.id;',
      ['username', 'surname', 'name', 1],
    );
  });

  it('should throw an error if updateUser does not return a row', async () => {
    mockConn.query.mockResolvedValue({ rowCount: 0, rows: [] });

    await expect(
      repo.updateUser(1, 'username', 'surname', 'name'),
    ).rejects.toThrow('Update user not found');
  });

  it('should call query with correct parameters when deleting a user', async () => {
    await repo.deleteUser(1);

    expect(mockConn.query).toHaveBeenCalledWith(
      'DELETE FROM "user" WHERE id = $1;',
      [1],
    );
  });

  it('should call query with correct parameters when finding all users', async () => {
    mockConn.query.mockResolvedValue({ rowCount: 0, rows: [] });
    await repo.findAllUsers();

    expect(mockConn.query).toHaveBeenCalledWith(
      ' SELECT u.id, u.username, u.surname, u.name, r.name AS role FROM "user" u LEFT JOIN role r ON u.roleId = r.id;',
    );
  });

  it('should call query with correct parameters when finding all available users', async () => {
    mockConn.query.mockResolvedValue({ rowCount: 0, rows: [] });
    await repo.findAllAvailableUsers();

    expect(mockConn.query).toHaveBeenCalledWith(
      ' SELECT u.id, u.username, u.surname, u.name, r.name AS role FROM "user" u LEFT JOIN role r ON u.roleId = r.id ' +
        'WHERE u.id NOT IN (SELECT user_id FROM ward_user) ',
    );
  });
});
