import { ReadStatusRepoPort } from 'src/api-auth-vimar/application/repository/read-status.repository';
import { ReadStatusAdapter } from './read-status.adapter';

describe('ReadStatusAdapter', () => {
  let adapter: ReadStatusAdapter;
  let repo: jest.Mocked<ReadStatusRepoPort>;

  beforeEach(() => {
    repo = {
      readStatus: jest.fn(),
    };
    adapter = new ReadStatusAdapter(repo);
  });

  it('should return linked=true when email exists', async () => {
    repo.readStatus.mockResolvedValue('utente@example.com');

    const result = await adapter.readStatus(42);

    expect(repo.readStatus).toHaveBeenCalledWith(42);
    expect(result).toEqual({
      isLinked: true,
      email: 'utente@example.com',
    });
  });

  it('should return linked=false when email is null', async () => {
    repo.readStatus.mockResolvedValue(null);

    const result = await adapter.readStatus(42);

    expect(result).toEqual({
      isLinked: false,
      email: '',
    });
  });
});