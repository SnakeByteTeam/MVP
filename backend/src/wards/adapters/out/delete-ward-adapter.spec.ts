import { DeleteWardCmd } from '../../application/commands/delete-ward-cmd';
import { DeleteWardAdapter } from './delete-ward-adapter';

describe('DeleteWardAdapter', () => {
  let adapter: DeleteWardAdapter;

  const deleteWardRepository = {
    deleteWard: jest.fn(),
  };

  beforeEach(() => {
    deleteWardRepository.deleteWard.mockReset();
    adapter = new DeleteWardAdapter(deleteWardRepository);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.deleteWard with correct args', async () => {
    const cmd = new DeleteWardCmd(1);
    deleteWardRepository.deleteWard.mockResolvedValue(undefined);

    await adapter.deleteWard(cmd);

    expect(deleteWardRepository.deleteWard).toHaveBeenCalledWith(1);
  });

  it('should propagate repository errors', async () => {
    const cmd = new DeleteWardCmd(1);
    const error = new Error('repository failure');
    deleteWardRepository.deleteWard.mockRejectedValue(error);

    await expect(adapter.deleteWard(cmd)).rejects.toThrow(error);
  });
});
