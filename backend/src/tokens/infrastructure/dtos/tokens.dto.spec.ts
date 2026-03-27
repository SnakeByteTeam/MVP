import { TokensDto } from './tokens.dto';

describe('TokensDto', () => {
  it('should hold token fields values', () => {
    const dto = new TokensDto();
    dto.accessToken = 'access-token';
    dto.refreshToken = 'refresh-token';
    dto.expiresIn = 3600;

    expect(dto.accessToken).toBe('access-token');
    expect(dto.refreshToken).toBe('refresh-token');
    expect(dto.expiresIn).toBe(3600);
  });
});
