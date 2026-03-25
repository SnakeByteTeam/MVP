import { Plant } from 'src/plant/domain/models/plant.model';
import { FetchPlantStructurePort } from '../ports/out/fetch-plant-structure.port';
import { WritePlantStructurePort } from '../ports/out/write-plant-structure.port';
import { SyncPlantService } from './sync-plant.service';

describe('SyncPlantService', () => {
  let service: SyncPlantService;
  let fetchPort: jest.Mocked<FetchPlantStructurePort>;
  let writePort: jest.Mocked<WritePlantStructurePort>;

  beforeEach(() => {
    fetchPort = {
      fetch: jest.fn(),
    };

    writePort = {
      writeStructure: jest.fn(),
    };

    service = new SyncPlantService(fetchPort, writePort);
  });

  it('should throw PlantId is null when cmd.id is absent', async () => {
    await expect(service.sync({ id: '' })).rejects.toThrow(Error('PlantId is null'));
  });

  it('should fetch and write plant structure when cmd is valid', async () => {
    const fetchedPlant = new Plant('plant-1', 'My Plant', []);

    fetchPort.fetch.mockResolvedValue(fetchedPlant);
    writePort.writeStructure.mockResolvedValue(true);

    const result = await service.sync({ id: 'plant-1' });

    expect(fetchPort.fetch).toHaveBeenCalledWith('plant-1');
    expect(fetchPort.fetch).toHaveBeenCalledTimes(1);
    expect(writePort.writeStructure).toHaveBeenCalledWith(fetchedPlant);
    expect(writePort.writeStructure).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });
});
