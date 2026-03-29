import { RefreshNodeSubCmd } from 'src/subscription/application/commands/refresh-node-sub.command';
import { RefreshNodeSubscriptionRepoPort } from 'src/subscription/application/repository/refresh-node-subscription.repository';
import { GetValidTokenPort } from 'src/tokens/application/ports/out/get-valid-token.port';
import { RefreshNodeSubscriptionAdapter } from './refresh-node-subscription.adapter';

describe('RefreshNodeSubscriptionAdapter', () => {
  let adapter: RefreshNodeSubscriptionAdapter;
  let nodeRepo: jest.Mocked<RefreshNodeSubscriptionRepoPort>;
  let getValidTokenPort: jest.Mocked<GetValidTokenPort>;

  beforeEach(() => {
    nodeRepo = {
      refreshSub: jest.fn(),
    };
    getValidTokenPort = {
      getValidToken: jest.fn(),
    };

    adapter = new RefreshNodeSubscriptionAdapter(nodeRepo, getValidTokenPort);
  });

  describe('refreshSub', () => {
    it('should refresh subscription successfully', async () => {
      const cmd: RefreshNodeSubCmd = { plantId: 'plant-1' };
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      nodeRepo.refreshSub.mockResolvedValue(true);

      const result = await adapter.refreshSub(cmd);

      expect(result).toBe(true);
      expect(getValidTokenPort.getValidToken).toHaveBeenCalledTimes(1);
      expect(nodeRepo.refreshSub).toHaveBeenCalledWith('valid-token', 'plant-1');
    });

    it('should throw error when plantId is null', async () => {
      const cmd: RefreshNodeSubCmd = { plantId: '' };

      await expect(adapter.refreshSub(cmd)).rejects.toThrow(
        'PlantId is null',
      );
    });

    it('should throw error when plantId is missing', async () => {
      const cmd: RefreshNodeSubCmd = {} as RefreshNodeSubCmd;

      await expect(adapter.refreshSub(cmd)).rejects.toThrow(
        'PlantId is null',
      );
    });

    it('should throw error when no valid token found', async () => {
      const cmd: RefreshNodeSubCmd = { plantId: 'plant-1' };
      getValidTokenPort.getValidToken.mockResolvedValue(null);

      await expect(adapter.refreshSub(cmd)).rejects.toThrow(
        'No valid token found',
      );
    });

    it('should handle refresh failure from repo', async () => {
      const cmd: RefreshNodeSubCmd = { plantId: 'plant-1' };
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      nodeRepo.refreshSub.mockResolvedValue(false);

      const result = await adapter.refreshSub(cmd);

      expect(result).toBe(false);
    });

    it('should propagate repo errors', async () => {
      const cmd: RefreshNodeSubCmd = { plantId: 'plant-1' };
      getValidTokenPort.getValidToken.mockResolvedValue('valid-token');
      nodeRepo.refreshSub.mockRejectedValue(
        new Error('Repository error'),
      );

      await expect(adapter.refreshSub(cmd)).rejects.toThrow(
        'Repository error',
      );
    });

    it('should propagate token port errors', async () => {
      const cmd: RefreshNodeSubCmd = { plantId: 'plant-1' };
      getValidTokenPort.getValidToken.mockRejectedValue(
        new Error('Token error'),
      );

      await expect(adapter.refreshSub(cmd)).rejects.toThrow('Token error');
    });
  });
});
