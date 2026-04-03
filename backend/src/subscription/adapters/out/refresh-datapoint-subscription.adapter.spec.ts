import { Test, TestingModule } from '@nestjs/testing';
import { RefreshDatapointSubAdapter } from './refresh-datapoint-subscription.adapter';
import {
  REFRESH_DATAPOINT_SUBSCRIPTION_REPO_PORT,
  type RefreshDatapointSubRepoPort,
} from 'src/subscription/application/repository/refresh-datapoint-subscription.respository';
import {
  GETVALIDTOKENPORT,
  type GetValidTokenPort,
} from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';

describe('RefreshDatapointSubAdapter', () => {
  let adapter: RefreshDatapointSubAdapter;
  let repo: jest.Mocked<RefreshDatapointSubRepoPort>;
  let getValidTokenPort: jest.Mocked<GetValidTokenPort>;

  beforeEach(async () => {
    repo = {
      refreshDatapointSub: jest.fn(),
    } as any;

    getValidTokenPort = {
      getValidToken: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshDatapointSubAdapter,
        { provide: REFRESH_DATAPOINT_SUBSCRIPTION_REPO_PORT, useValue: repo },
        { provide: GETVALIDTOKENPORT, useValue: getValidTokenPort },
      ],
    }).compile();

    adapter = module.get<RefreshDatapointSubAdapter>(
      RefreshDatapointSubAdapter,
    );
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('refreshDatapointSub', () => {
    it('should refresh datapoint subscription with valid token', async () => {
      const cmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      repo.refreshDatapointSub.mockResolvedValue(true);

      const result = await adapter.refreshDatapointSub(cmd);

      expect(result).toBe(true);
      expect(getValidTokenPort.getValidToken).toHaveBeenCalledTimes(1);
      expect(repo.refreshDatapointSub).toHaveBeenCalledWith(
        'valid-token',
        'plant-123',
      );
    });

    it('should throw error when no valid token found', async () => {
      const cmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockResolvedValue(null);

      await expect(adapter.refreshDatapointSub(cmd)).rejects.toThrow(
        'No valid token found',
      );
    });

    it('should throw error when plantId is null', async () => {
      const cmd = { plantId: null };
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');

      await expect(adapter.refreshDatapointSub(cmd as any)).rejects.toThrow(
        'PlantId is null',
      );
    });

    it('should propagate repo errors', async () => {
      const cmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      repo.refreshDatapointSub.mockRejectedValue(new Error('Repo error'));

      await expect(adapter.refreshDatapointSub(cmd)).rejects.toThrow(
        'Repo error',
      );
    });

    it('should handle multiple refresh calls', async () => {
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      repo.refreshDatapointSub.mockResolvedValue(true);

      await adapter.refreshDatapointSub({ plantId: 'plant-1' });
      await adapter.refreshDatapointSub({ plantId: 'plant-2' });

      expect(repo.refreshDatapointSub).toHaveBeenCalledTimes(2);
    });

    it('should handle returned false from repo', async () => {
      const cmd = { plantId: 'plant-456' };
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      repo.refreshDatapointSub.mockResolvedValue(false);

      const result = await adapter.refreshDatapointSub(cmd);

      expect(result).toBe(false);
    });
  });
});
