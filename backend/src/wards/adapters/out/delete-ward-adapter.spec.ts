import { DeleteWardAdapter } from './delete-ward-adapter';
import { DeleteWardCmd } from '../../application/commands/delete-ward-cmd';

describe('DeleteWardAdapter', () => {
  const deleteWardRepository = {
    deleteWard: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(new DeleteWardAdapter(deleteWardRepository as any)).toBeDefined();
  });

  it('should delegate deleteWard to repository with ward id', async () => {
    const adapter = new DeleteWardAdapter(deleteWardRepository as any);
    deleteWardRepository.deleteWard.mockResolvedValueOnce(undefined);

    await adapter.deleteWard(new DeleteWardCmd(11));

    expect(deleteWardRepository.deleteWard).toHaveBeenCalledWith(11);
  });
});
