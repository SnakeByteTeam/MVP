import { AddUserToWardCmd } from 'src/wards/application/commands/add-user-to-ward-cmd';
import { WardsUsersRelationshipsPersistenceAdapter } from '../../../../../src/wards/adapters/out/wards-users-relationships-persistence-adapter';
import { FindAllUsersByWardIdCmd } from 'src/wards/application/commands/find-all-users-by-ward-id-cmd';
import { User } from 'src/wards/domain/user';
import { RemoveUserFromWardCmd } from 'src/wards/application/commands/remove-user-from-ward-cmd';

describe('WardsUsersRelationshipsPersistenceAdapter', () => {
  let adapter: WardsUsersRelationshipsPersistenceAdapter;

  const mockRepo = {
    addUserToWard: jest.fn(),
    findAllUsersByWardId: jest.fn(),
    removeUserFromWard: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.addUserToWard.mockReset();
    mockRepo.findAllUsersByWardId.mockReset();
    mockRepo.removeUserFromWard.mockReset();
    adapter = new WardsUsersRelationshipsPersistenceAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.addUserToWard with correct args', async () => {
    const cmd = new AddUserToWardCmd(1, 1);
    mockRepo.addUserToWard.mockResolvedValue({
      id: 1,
      name: 'name',
    });

    await adapter.addUserToWard(cmd);

    expect(mockRepo.addUserToWard).toHaveBeenCalledWith(1, 1);
  });

  it('should propagate repository errors', async () => {
    const cmd = new AddUserToWardCmd(1, 1);
    const error = new Error('repository failure');
    mockRepo.addUserToWard.mockRejectedValue(error);

    await expect(adapter.addUserToWard(cmd)).rejects.toThrow(error);
  });

  it('should call repository.findAllUsersByWardId with correct args', async () => {
    const cmd = new FindAllUsersByWardIdCmd(1);
    mockRepo.findAllUsersByWardId.mockResolvedValue([]);

    await adapter.findAllUsersByWardId(cmd);

    expect(mockRepo.findAllUsersByWardId).toHaveBeenCalledWith(1);
  });

  it('should map UserEntity to User', async () => {
    const mockEntities = [
      { id: 1, username: 'user1' },
      { id: 2, username: 'user2' },
    ];

    mockRepo.findAllUsersByWardId.mockResolvedValue(mockEntities);

    const result = await adapter.findAllUsersByWardId(
      new FindAllUsersByWardIdCmd(1),
    );

    expect(result).toEqual([new User(1, 'user1'), new User(2, 'user2')]);
  });

  it('should propagate repository errors', async () => {
    const cmd = new FindAllUsersByWardIdCmd(1);
    const error = new Error('repository failure');
    mockRepo.findAllUsersByWardId.mockRejectedValue(error);

    await expect(adapter.findAllUsersByWardId(cmd)).rejects.toThrow(error);
  });

    it('should call repository.removeUserFromWard with correct args', async () => {
      const cmd = new RemoveUserFromWardCmd(1, 1);
      mockRepo.removeUserFromWard.mockResolvedValue(undefined);
  
      await adapter.removeUserFromWard(cmd);
  
      expect(mockRepo.removeUserFromWard).toHaveBeenCalledWith(1, 1);
    });
  
    it('should propagate repository errors', async () => {
      const cmd = new RemoveUserFromWardCmd(1, 1);
      const error = new Error('repository failure');
      mockRepo.removeUserFromWard.mockRejectedValue(error);
  
      await expect(adapter.removeUserFromWard(cmd)).rejects.toThrow(error);
    });
});
