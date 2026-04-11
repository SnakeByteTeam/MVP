import { CreateWardCmd } from 'src/wards/application/commands/create-ward-cmd';
import { WardsPersistenceAdapter } from '../../../../../src/wards/adapters/out/wards-persistence-adapter';
import { DeleteWardCmd } from 'src/wards/application/commands/delete-ward-cmd';
import { Ward } from 'src/wards/domain/ward';
import { UpdateWardCmd } from 'src/wards/application/commands/update-ward-cmd';

describe('WardsPersistenceAdapter', () => {
  let adapter: WardsPersistenceAdapter;

  const mockRepo = {
    createWard: jest.fn(),
    findAllWards: jest.fn(),
    updateWard: jest.fn(),
    deleteWard: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.createWard.mockReset();
    mockRepo.findAllWards.mockReset();
    mockRepo.updateWard.mockReset();
    mockRepo.deleteWard.mockReset();
    adapter = new WardsPersistenceAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.createWard with correct args', async () => {
    const cmd = new CreateWardCmd('name');
    mockRepo.createWard.mockResolvedValue({
      id: 1,
      name: 'name',
    });

    await adapter.createWard(cmd);

    expect(mockRepo.createWard).toHaveBeenCalledWith('name');
  });

  it('should propagate repository errors', async () => {
    const cmd = new CreateWardCmd('name');
    const error = new Error('repository failure');
    mockRepo.createWard.mockRejectedValue(error);

    await expect(adapter.createWard(cmd)).rejects.toThrow(error);
  });

  it('should call repository.findAllWards with correct args', async () => {
    mockRepo.findAllWards.mockResolvedValue([]);

    await adapter.findAllWards();

    expect(mockRepo.findAllWards).toHaveBeenCalledWith();
  });

  it('should map WardEntity to Ward', async () => {
    const mockEntities = [
      { id: 1, name: 'ward1' },
      { id: 2, name: 'ward2' },
    ];

    mockRepo.findAllWards.mockResolvedValue(mockEntities);

    const result = await adapter.findAllWards();

    expect(result).toEqual([new Ward(1, 'ward1'), new Ward(2, 'ward2')]);
  });

  it('should propagate repository errors', async () => {
    const error = new Error('repository failure');
    mockRepo.findAllWards.mockRejectedValue(error);

    await expect(adapter.findAllWards()).rejects.toThrow(error);
  });

  it('should call repository.updateWard with correct args', async () => {
    const cmd = new UpdateWardCmd(1, 'new name');
    mockRepo.updateWard.mockResolvedValue({
      id: 1,
      name: 'new name',
    });

    await adapter.updateWard(cmd);

    expect(mockRepo.updateWard).toHaveBeenCalledWith(1, 'new name');
  });

  it('should propagate repository errors', async () => {
    const cmd = new UpdateWardCmd(1, 'new name');
    const error = new Error('repository failure');
    mockRepo.updateWard.mockRejectedValue(error);

    await expect(adapter.updateWard(cmd)).rejects.toThrow(error);
  });

  it('should call repository.deleteWard with correct args', async () => {
    const cmd = new DeleteWardCmd(1);
    mockRepo.deleteWard.mockResolvedValue(undefined);

    await adapter.deleteWard(cmd);

    expect(mockRepo.deleteWard).toHaveBeenCalledWith(1);
  });

  it('should propagate repository errors', async () => {
    const cmd = new DeleteWardCmd(1);
    const error = new Error('repository failure');
    mockRepo.deleteWard.mockRejectedValue(error);

    await expect(adapter.deleteWard(cmd)).rejects.toThrow(error);
  });


});
