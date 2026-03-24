import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CHECK_CREDENTIALS_PORT } from '../../adapters/out/check-credentials-adapter';
import { GENERATE_ACCESS_TOKEN_PORT } from '../../adapters/out/generate-access-token-adapter';
import { GENERATE_REFRESH_TOKEN_PORT } from '../../adapters/out/generate-refresh-token-adapter';
import { EXTRACT_FROM_ACCESS_TOKEN_PORT } from '../../adapters/out/extract-from-access-token-adapter';
import { EXTRACT_FROM_REFRESH_TOKEN_PORT } from '../../adapters/out/extract-from-refresh-token-adapter';

describe("AuthService", () => {
  let service: AuthService;

  const mockCheckCredentials = {
    checkCredentials: jest.fn(),
  };

  const mockGenerateAccessToken = {
    generateAccessToken: jest.fn(),
  };

  const mockGenerateRefreshToken = {
    generateRefreshToken: jest.fn(),
  };

  const mockExtractFromAccessToken = {
    extractFromAccessToken: jest.fn(),
  };

  const mockExtractFromRefreshToken = {
    extractFromRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: CHECK_CREDENTIALS_PORT, useValue: mockCheckCredentials },
        { provide: GENERATE_ACCESS_TOKEN_PORT, useValue: mockGenerateAccessToken },
        { provide: GENERATE_REFRESH_TOKEN_PORT, useValue: mockGenerateRefreshToken },
        { provide: EXTRACT_FROM_ACCESS_TOKEN_PORT, useValue: mockExtractFromAccessToken },
        { provide: EXTRACT_FROM_REFRESH_TOKEN_PORT, useValue: mockExtractFromRefreshToken },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should login and return tokens", () => {
    const payload = { userId: 1, role: "admin" };
    const accessToken = "access-token";
    const refreshToken = "refresh-token";

    mockCheckCredentials.checkCredentials.mockReturnValue(payload);
    mockGenerateAccessToken.generateAccessToken.mockReturnValue(accessToken);
    mockGenerateRefreshToken.generateRefreshToken.mockReturnValue(refreshToken);

    const result = service.login({ username: "u", password: "p" });

    expect(mockCheckCredentials.checkCredentials).toHaveBeenCalled();
    expect(mockGenerateAccessToken.generateAccessToken).toHaveBeenCalled();
    expect(mockGenerateRefreshToken.generateRefreshToken).toHaveBeenCalled();

    expect(result).toEqual({
      accessToken,
      refreshToken,
    });
  });
});