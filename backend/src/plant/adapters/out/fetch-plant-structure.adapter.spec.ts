import { FetchPlantStructureAdapter } from './fetch-plant-structure.adapter';
import { GetValidTokenPort } from 'src/tokens/application/ports/out/get-valid-token.port';
import { FetchPlantStructureRepo } from 'src/plant/application/repository/fetch-plant-structure.repository';
import { PlantDto } from 'src/plant/infrastructure/http/dtos/plant.dto';

describe('FetchPlantStructureAdapter', () => {
  let adapter: FetchPlantStructureAdapter;
  let tokenPort: jest.Mocked<GetValidTokenPort>;
  let repoPort: jest.Mocked<FetchPlantStructureRepo>;

  beforeEach(() => {
    tokenPort = {
      getValidToken: jest.fn(),
    };

    repoPort = {
      fetch: jest.fn(),
    };

    adapter = new FetchPlantStructureAdapter(tokenPort, repoPort);
  });

  it('should throw when token is not valid', async () => {
    tokenPort.getValidToken.mockResolvedValue(null);

    await expect(adapter.fetch('plant-1')).rejects.toThrow(
      Error('Token is not valid'),
    );
    expect(repoPort.fetch).toHaveBeenCalledTimes(0);
  });

  it('should throw when API does not return plant dto', async () => {
    tokenPort.getValidToken.mockResolvedValue('valid-token');
    repoPort.fetch.mockResolvedValue(null);

    await expect(adapter.fetch('plant-1')).rejects.toThrow(
      Error("Can't get plant info from API"),
    );
    expect(repoPort.fetch).toHaveBeenCalledWith('valid-token', 'plant-1');
  });

  it('should return mapped plant from dto', async () => {
    const dto = new PlantDto();
    dto.id = 'plant-1';
    dto.name = 'My Plant';
    dto.rooms = [];
    dto.cached_at = new Date('2026-03-24T12:00:00.000Z');

    tokenPort.getValidToken.mockResolvedValue('valid-token');
    repoPort.fetch.mockResolvedValue(dto);

    const plant = await adapter.fetch('plant-1');

    expect(tokenPort.getValidToken).toHaveBeenCalledTimes(1);
    expect(repoPort.fetch).toHaveBeenCalledWith('valid-token', 'plant-1');
    expect(plant.getId()).toBe('plant-1');
    expect(plant.getName()).toBe('My Plant');
    expect(plant.getCachedAt().toISOString()).toBe('2026-03-24T12:00:00.000Z');
  });
});
