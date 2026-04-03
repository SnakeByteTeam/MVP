import { Ward } from '../../domain/ward';
import { FindAllWardsAdapter } from './find-all-wards-adapter';

describe('FindAllWardsAdapter', () => {
  let adapter: FindAllWardsAdapter;

  const mockRepo = {
    findAllWards: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.findAllWards.mockReset();
    adapter = new FindAllWardsAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
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
});
