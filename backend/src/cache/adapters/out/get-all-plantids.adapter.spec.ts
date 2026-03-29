import { GetAllPlantIdsAdapter } from './get-all-plantids.adapter';
import { GetAllPlantIdsRepoPort } from 'src/cache/application/repository/get-all-plantids.repository';
import { GetValidTokenPort } from 'src/tokens/application/ports/out/get-valid-token.port';

describe('GetAllPlantIdsAdapter', () => {
  let adapter: GetAllPlantIdsAdapter;
  let repo: jest.Mocked<GetAllPlantIdsRepoPort>;
  let getValidTokenPort: jest.Mocked<GetValidTokenPort>;

  beforeEach(() => {
    repo = {
      getAllPlantIds: jest.fn(),
    };
    getValidTokenPort = {
      getValidToken: jest.fn(),
    };

    adapter = new GetAllPlantIdsAdapter(repo, getValidTokenPort);
  });

  it('should fetch plant ids from repo with valid token', async () => {
    getValidTokenPort.getValidToken.mockResolvedValue('valid-token-abc123');
    repo.getAllPlantIds.mockResolvedValue(['plant-1', 'plant-2', 'plant-3']);

    const result = await adapter.getAllPlantIds();

    expect(result).toEqual(['plant-1', 'plant-2', 'plant-3']);
    expect(getValidTokenPort.getValidToken).toHaveBeenCalledTimes(1);
    expect(repo.getAllPlantIds).toHaveBeenCalledWith('valid-token-abc123');
    expect(repo.getAllPlantIds).toHaveBeenCalledTimes(1);
  });

  it('should throw error when token is not valid', async () => {
    getValidTokenPort.getValidToken.mockResolvedValue(null);

    await expect(adapter.getAllPlantIds()).rejects.toThrow(
      'Failed to get valid token',
    );

    expect(getValidTokenPort.getValidToken).toHaveBeenCalledTimes(1);
    expect(repo.getAllPlantIds).not.toHaveBeenCalled();
  });

  it('should throw error when token is empty string', async () => {
    getValidTokenPort.getValidToken.mockResolvedValue('');

    await expect(adapter.getAllPlantIds()).rejects.toThrow(
      'Failed to get valid token',
    );
  });

  it('should throw error when repo fails', async () => {
    getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
    repo.getAllPlantIds.mockRejectedValue(new Error('Database error'));

    await expect(adapter.getAllPlantIds()).rejects.toThrow('Database error');
  });

  it('should return empty array when no plants available', async () => {
    getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
    repo.getAllPlantIds.mockResolvedValue([]);

    const result = await adapter.getAllPlantIds();

    expect(result).toEqual([]);
  });
});
