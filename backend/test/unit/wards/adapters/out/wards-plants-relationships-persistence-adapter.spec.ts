import { AddPlantToWardCmd } from 'src/wards/application/commands/add-plant-to-ward-cmd';
import { WardsPlantsRelationshipsPersistenceAdapter } from '../../../../../src/wards/adapters/out/wards-plants-relationships-persistence-adapter';
import { Plant } from 'src/plant/domain/models/plant.model';
import { FindAllPlantsByWardIdCmd } from 'src/wards/application/commands/find-all-plants-by-ward-id-cmd';
import { RemovePlantFromWardCmd } from 'src/wards/application/commands/remove-plant-from-ward-cmd';

describe('WardsPlantsRelationshipsPersistenceAdapter', () => {
  let adapter: WardsPlantsRelationshipsPersistenceAdapter;

  const mockRepo = {
    addPlantToWard: jest.fn(),
    findAllPlantsByWardId: jest.fn(),
    removePlantFromWard: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.addPlantToWard.mockReset();
    mockRepo.findAllPlantsByWardId.mockReset();
    mockRepo.removePlantFromWard.mockReset();
    adapter = new WardsPlantsRelationshipsPersistenceAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.addPlantToWard with correct args', async () => {
    const cmd = new AddPlantToWardCmd(1, 'id');
    mockRepo.addPlantToWard.mockResolvedValue({
      id: 1,
      name: 'new name',
    });

    await adapter.addPlantToWard(cmd);

    expect(mockRepo.addPlantToWard).toHaveBeenCalledWith(1, 'id');
  });

  it('should propagate repository errors', async () => {
    const cmd = new AddPlantToWardCmd(1, 'id');
    const error = new Error('repository failure');
    mockRepo.addPlantToWard.mockRejectedValue(error);

    await expect(adapter.addPlantToWard(cmd)).rejects.toThrow(error);
  });

  it('should call repository.findAllPlantsByWardId with correct args', async () => {
    const cmd = new FindAllPlantsByWardIdCmd(1);
    mockRepo.findAllPlantsByWardId.mockResolvedValue([]);

    await adapter.findAllPlantsByWardId(cmd);

    expect(mockRepo.findAllPlantsByWardId).toHaveBeenCalledWith(1);
  });

  it('should map PlantEntity to Plant', async () => {
    const mockEntities = [
      { id: 'id1', name: 'plant1' },
      { id: 'id2', name: 'plant2' },
    ];

    mockRepo.findAllPlantsByWardId.mockResolvedValue(mockEntities);

    const result = await adapter.findAllPlantsByWardId(
      new FindAllPlantsByWardIdCmd(1),
    );

    expect(result).toEqual([
      new Plant('id1', 'plant1'),
      new Plant('id2', 'plant2'),
    ]);
  });

  it('should propagate repository errors', async () => {
    const cmd = new FindAllPlantsByWardIdCmd(1);
    const error = new Error('repository failure');
    mockRepo.findAllPlantsByWardId.mockRejectedValue(error);

    await expect(adapter.findAllPlantsByWardId(cmd)).rejects.toThrow(error);
  });

  it('should call repository.removePlantFromWard with correct args', async () => {
    const cmd = new RemovePlantFromWardCmd('id');
    mockRepo.removePlantFromWard.mockResolvedValue(undefined);

    await adapter.removePlantFromWard(cmd);

    expect(mockRepo.removePlantFromWard).toHaveBeenCalledWith('id');
  });

  it('should propagate repository errors', async () => {
    const cmd = new RemovePlantFromWardCmd('id');
    const error = new Error('repository failure');
    mockRepo.removePlantFromWard.mockRejectedValue(error);

    await expect(adapter.removePlantFromWard(cmd)).rejects.toThrow(error);
  });
});
