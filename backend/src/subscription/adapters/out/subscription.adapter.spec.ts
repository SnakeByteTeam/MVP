import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionAdapter } from './subscription.adapter';
import {
  SUBSCRIPTION_REPOSITORY_PORT,
  type SubscriptionRepositoryPort,
} from 'src/subscription/application/repository/subscription.repository';
import {
  GETVALIDTOKENPORT,
  type GetValidTokenPort,
} from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';
import { RefreshDatapointSubCmd } from 'src/subscription/application/commands/refresh-datapoint-sub.command';
import { RefreshNodeSubCmd } from 'src/subscription/application/commands/refresh-node-sub.command';

describe('SubscriptionAdapter', () => {
  let adapter: SubscriptionAdapter;
  let repo: jest.Mocked<SubscriptionRepositoryPort>;
  let getValidTokenPort: jest.Mocked<GetValidTokenPort>;

  beforeEach(async () => {
    repo = {
      refreshDatapointSub: jest.fn(),
      refreshSub: jest.fn(),
    };

    getValidTokenPort = {
      getValidToken: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionAdapter,
        { provide: SUBSCRIPTION_REPOSITORY_PORT, useValue: repo },
        { provide: GETVALIDTOKENPORT, useValue: getValidTokenPort },
      ],
    }).compile();

    adapter = module.get<SubscriptionAdapter>(SubscriptionAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('refreshSub', () => {
    it('should refresh node subscription successfully', async () => {
      const cmd: RefreshNodeSubCmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      repo.refreshSub.mockResolvedValue(true);

      const result = await adapter.refreshSub(cmd);

      expect(result).toBe(true);
      expect(getValidTokenPort.getValidToken).toHaveBeenCalledTimes(1);
      expect(repo.refreshSub).toHaveBeenCalledWith('valid-token', 'plant-123');
    });

    it('should throw error when plantId is null', async () => {
      const cmd: RefreshNodeSubCmd = { plantId: '' };

      await expect(adapter.refreshSub(cmd)).rejects.toThrow('PlantId is null');
    });

    it('should throw error when plantId is missing', async () => {
      const cmd: RefreshNodeSubCmd = {} as RefreshNodeSubCmd;

      await expect(adapter.refreshSub(cmd)).rejects.toThrow('PlantId is null');
    });

    it('should throw error when no valid token found', async () => {
      const cmd: RefreshNodeSubCmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockResolvedValue(null);

      await expect(adapter.refreshSub(cmd)).rejects.toThrow(
        'No valid token found',
      );
    });

    it('should handle refresh failure from repo', async () => {
      const cmd: RefreshNodeSubCmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      repo.refreshSub.mockResolvedValue(false);

      const result = await adapter.refreshSub(cmd);

      expect(result).toBe(false);
    });

    it('should propagate repo errors', async () => {
      const cmd: RefreshNodeSubCmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      repo.refreshSub.mockRejectedValue(new Error('Repository error'));

      await expect(adapter.refreshSub(cmd)).rejects.toThrow(
        'Repository error',
      );
    });

    it('should propagate token port errors', async () => {
      const cmd: RefreshNodeSubCmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockRejectedValue(
        new Error('Token error'),
      );

      await expect(adapter.refreshSub(cmd)).rejects.toThrow('Token error');
    });
  });

  describe('refreshDatapointSub', () => {
    it('should refresh datapoint subscription successfully', async () => {
      const cmd: RefreshDatapointSubCmd = { plantId: 'plant-123' };
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

    it('should throw error when plantId is null', async () => {
      const cmd: RefreshDatapointSubCmd = { plantId: '' };

      await expect(adapter.refreshDatapointSub(cmd)).rejects.toThrow(
        'PlantId is null',
      );
    });

    it('should throw error when plantId is missing', async () => {
      const cmd: RefreshDatapointSubCmd = {} as RefreshDatapointSubCmd;

      await expect(adapter.refreshDatapointSub(cmd)).rejects.toThrow(
        'PlantId is null',
      );
    });

    it('should throw error when no valid token found', async () => {
      const cmd: RefreshDatapointSubCmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockResolvedValue(null);

      await expect(adapter.refreshDatapointSub(cmd)).rejects.toThrow(
        'No valid token found',
      );
    });

    it('should handle refresh failure from repo', async () => {
      const cmd: RefreshDatapointSubCmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      repo.refreshDatapointSub.mockResolvedValue(false);

      const result = await adapter.refreshDatapointSub(cmd);

      expect(result).toBe(false);
    });

    it('should propagate repo errors', async () => {
      const cmd: RefreshDatapointSubCmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      repo.refreshDatapointSub.mockRejectedValue(new Error('Repository error'));

      await expect(adapter.refreshDatapointSub(cmd)).rejects.toThrow(
        'Repository error',
      );
    });

    it('should propagate token port errors', async () => {
      const cmd: RefreshDatapointSubCmd = { plantId: 'plant-123' };
      getValidTokenPort.getValidToken.mockRejectedValue(
        new Error('Token error'),
      );

      await expect(adapter.refreshDatapointSub(cmd)).rejects.toThrow(
        'Token error',
      );
    });
  });
});
