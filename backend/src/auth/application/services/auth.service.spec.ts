import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CHECK_CREDENTIALS_PORT } from '../../adapters/out/check-credentials-adapter';
import { GENERATE_ACCESS_TOKEN_PORT } from '../../adapters/out/generate-access-token-adapter';
import { GENERATE_REFRESH_TOKEN_PORT } from '../../adapters/out/generate-refresh-token-adapter';
import { EXTRACT_FROM_ACCESS_TOKEN_PORT } from '../../adapters/out/extract-from-access-token-adapter';
import { EXTRACT_FROM_REFRESH_TOKEN_PORT } from '../../adapters/out/extract-from-refresh-token-adapter';
import { CHANGE_CREDENTIALS_PORT } from '../../adapters/out/change-credentials-adapter';
import { GENERATE_CHANGE_PASSWORD_ACCESS_TOKEN_PORT } from '../../adapters/out/generate-change-password-access-token-adapter';
import { GENERATE_CHANGE_PASSWORD_REFRESH_TOKEN_PORT } from '../../adapters/out/generate-change-password-refresh-token-adapter';
import { HASH_PASSWORD_PORT } from '../../adapters/out/hash-password-adapter';

describe('AuthService', () => {
  let service: AuthService;

  const mockChangeCredentials = { changeCredentials: jest.fn() };
  const mockCheckCredentials = { checkCredentials: jest.fn() };
  const mockGenerateChangePasswordAccessToken = {
    generateChangePasswordAccessToken: jest.fn(),
  };
  const mockGenerateChangePasswordRefreshToken = {
    generateChangePasswordRefreshToken: jest.fn(),
  };
  const mockGenerateAccessToken = { generateAccessToken: jest.fn() };
  const mockGenerateRefreshToken = { generateRefreshToken: jest.fn() };
  const mockExtractFromAccessToken = { extractFromAccessToken: jest.fn() };
  const mockExtractFromRefreshToken = { extractFromRefreshToken: jest.fn() };
  const mockHashPassword = { hashPassword: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: CHANGE_CREDENTIALS_PORT, useValue: mockChangeCredentials },
        { provide: CHECK_CREDENTIALS_PORT, useValue: mockCheckCredentials },
        { provide: HASH_PASSWORD_PORT, useValue: mockHashPassword },
        {
          provide: GENERATE_CHANGE_PASSWORD_ACCESS_TOKEN_PORT,
          useValue: mockGenerateChangePasswordAccessToken,
        },
        {
          provide: GENERATE_CHANGE_PASSWORD_REFRESH_TOKEN_PORT,
          useValue: mockGenerateChangePasswordRefreshToken,
        },
        {
          provide: GENERATE_ACCESS_TOKEN_PORT,
          useValue: mockGenerateAccessToken,
        },
        {
          provide: GENERATE_REFRESH_TOKEN_PORT,
          useValue: mockGenerateRefreshToken,
        },
        {
          provide: EXTRACT_FROM_ACCESS_TOKEN_PORT,
          useValue: mockExtractFromAccessToken,
        },
        {
          provide: EXTRACT_FROM_REFRESH_TOKEN_PORT,
          useValue: mockExtractFromRefreshToken,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('firstLogin: should check credentials, change credentials and return tokens', async () => {
    const payload = { id: 1, role: 'user', firstAccess: true };
    const accessToken = 'access-first';
    const refreshToken = 'refresh-first';

    mockCheckCredentials.checkCredentials.mockResolvedValue(payload);
    mockChangeCredentials.changeCredentials.mockResolvedValue(undefined);
    mockGenerateAccessToken.generateAccessToken.mockReturnValue(accessToken);
    mockGenerateRefreshToken.generateRefreshToken.mockReturnValue(refreshToken);

    const result = await service.firstLogin({
      username: 'u',
      password: 'newp',
      tempPassword: 'tmp',
    } as any);

    expect(mockCheckCredentials.checkCredentials).toHaveBeenCalled();
    expect(mockChangeCredentials.changeCredentials).toHaveBeenCalledWith(
      expect.any(Object),
    );
    expect(mockGenerateAccessToken.generateAccessToken).toHaveBeenCalled();
    expect(mockGenerateRefreshToken.generateRefreshToken).toHaveBeenCalled();
    expect(result).toEqual({ accessToken, refreshToken });
  });

  it('login: should return change-password tokens when firstAccess is true', async () => {
    const payload = { id: 2, role: 'user', firstAccess: true };
    const accessToken = 'cp-access';
    const refreshToken = 'cp-refresh';

    mockCheckCredentials.checkCredentials.mockResolvedValue(payload);
    mockGenerateChangePasswordAccessToken.generateChangePasswordAccessToken.mockReturnValue(
      accessToken,
    );
    mockGenerateChangePasswordRefreshToken.generateChangePasswordRefreshToken.mockReturnValue(
      refreshToken,
    );

    const result = await service.login({ username: 'u', password: 'p' } as any);

    expect(mockCheckCredentials.checkCredentials).toHaveBeenCalled();
    expect(
      mockGenerateChangePasswordAccessToken.generateChangePasswordAccessToken,
    ).toHaveBeenCalled();
    expect(
      mockGenerateChangePasswordRefreshToken.generateChangePasswordRefreshToken,
    ).toHaveBeenCalled();
    expect(result).toEqual({ accessToken, refreshToken });
  });

  it('login: should return normal tokens when firstAccess is false', async () => {
    const payload = { id: 3, role: 'user', firstAccess: false };
    const accessToken = 'normal-access';
    const refreshToken = 'normal-refresh';

    mockCheckCredentials.checkCredentials.mockResolvedValue(payload);
    mockGenerateAccessToken.generateAccessToken.mockReturnValue(accessToken);
    mockGenerateRefreshToken.generateRefreshToken.mockReturnValue(refreshToken);

    const result = await service.login({ username: 'u', password: 'p' } as any);

    expect(mockCheckCredentials.checkCredentials).toHaveBeenCalled();
    expect(mockGenerateAccessToken.generateAccessToken).toHaveBeenCalled();
    expect(mockGenerateRefreshToken.generateRefreshToken).toHaveBeenCalled();
    expect(result).toEqual({ accessToken, refreshToken });
  });

  it('refresh: should extract payload and generate new access token', () => {
    const payload = { id: 4, role: 'user' };
    const newAccessToken = 'new-access';

    mockExtractFromRefreshToken.extractFromRefreshToken.mockReturnValue(
      payload,
    );
    mockGenerateAccessToken.generateAccessToken.mockReturnValue(newAccessToken);

    const result = service.refresh({ refreshToken: 'rt' } as any);

    expect(
      mockExtractFromRefreshToken.extractFromRefreshToken,
    ).toHaveBeenCalled();
    expect(mockGenerateAccessToken.generateAccessToken).toHaveBeenCalled();
    expect(result).toBe(newAccessToken);
  });
});
