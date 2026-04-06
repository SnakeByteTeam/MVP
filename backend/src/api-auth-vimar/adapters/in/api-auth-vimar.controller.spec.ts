import { Test, TestingModule } from '@nestjs/testing';
import { ApiAuthVimarController } from './api-auth-vimar.controller';
import {
  APIAUTHUSECASE,
  type ApiAuthUseCase,
} from 'src/api-auth-vimar/application/ports/in/api-auth.usecase';
import {
  GETTOKENSCALLBACKUSECASE,
  type GetTokensCallbackUseCase,
} from 'src/api-auth-vimar/application/ports/in/get-tokens.usecase';
import {
  GETVALIDTOKENPORT,
  type GetValidTokenPort,
} from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';
import {
  DELETETOKENSFROMREPOPORT,
  type DeleteTokensFromRepoPort,
} from 'src/api-auth-vimar/application/ports/out/delete-tokens-from-repo.port';
import { PlantAuthDto } from 'src/api-auth-vimar/infrastructure/dto/plant-auth.dto';
import { GuardModule } from 'src/guard/guard.module';
import { AdminGuard } from 'src/guard/admin/admin.guard';
import { JwtService } from '@nestjs/jwt';

describe('ApiAuthVimarController', () => {
  let controller: ApiAuthVimarController;
  let apiAuthUseCase: jest.Mocked<ApiAuthUseCase>;
  let getTokensCallbackUseCase: jest.Mocked<GetTokensCallbackUseCase>;
  let getValidTokenPort: jest.Mocked<GetValidTokenPort>;
  let deleteTokensFromRepo: jest.Mocked<DeleteTokensFromRepoPort>;

  beforeEach(async () => {
    apiAuthUseCase = {
      getLoginUrl: jest.fn(),
    };
    getTokensCallbackUseCase = {
      getTokens: jest.fn(),
    };

    getValidTokenPort = {
      getValidToken: jest.fn(),
    };

    deleteTokensFromRepo = {
      deleteTokens: jest.fn(),
    };

    getTokensCallbackUseCase = {
      getTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [GuardModule],
      controllers: [ApiAuthVimarController],
      providers: [
        {
          provide: APIAUTHUSECASE,
          useValue: apiAuthUseCase,
        },
        {
          provide: GETTOKENSCALLBACKUSECASE,
          useValue: getTokensCallbackUseCase,
        },
        {
          provide: GETVALIDTOKENPORT,
          useValue: getValidTokenPort,
        },
        {
          provide: DELETETOKENSFROMREPOPORT,
          useValue: deleteTokensFromRepo,
        },
        {
          provide: AdminGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ApiAuthVimarController>(ApiAuthVimarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return redirect url and 302 status code', () => {
    apiAuthUseCase.getLoginUrl.mockReturnValue('url-login');

    const payload: PlantAuthDto = {
      redirect_url: 'http://localhost:4200/callback',
    };

    const result = controller.login(payload);

    expect(apiAuthUseCase.getLoginUrl).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      url: 'url-login',
      statusCode: 302,
    });
  });

  describe('getAccountStatus', () => {
    it('should return linked=true when a valid token is available', async () => {
      getValidTokenPort.getValidToken.mockResolvedValue('token-123');

      const result = await controller.getAccountStatus();

      expect(getValidTokenPort.getValidToken).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        isLinked: true,
        email: '',
      });
    });

    it('should return linked=false when token is not available', async () => {
      getValidTokenPort.getValidToken.mockRejectedValue(
        new Error('No tokens found in cache'),
      );

      const result = await controller.getAccountStatus();

      expect(getValidTokenPort.getValidToken).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        isLinked: false,
        email: '',
      });
    });
  });

  describe('disconnectAccount', () => {
    it('should clear tokens and return success=true', async () => {
      deleteTokensFromRepo.deleteTokens.mockResolvedValue(true);

      const result = await controller.disconnectAccount();

      expect(deleteTokensFromRepo.deleteTokens).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true });
    });

    it('should throw InternalServerErrorException when clear fails', async () => {
      deleteTokensFromRepo.deleteTokens.mockResolvedValue(false);

      await expect(controller.disconnectAccount()).rejects.toThrow(
        'Internal server error',
      );
      expect(deleteTokensFromRepo.deleteTokens).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveTokens', () => {
    it('should save tokens and return redirect url with 302 status code', async () => {
      getTokensCallbackUseCase.getTokens.mockResolvedValue(undefined);

      const redirectUrl = 'http://localhost:4200/dashboard';
      const state = Buffer.from(redirectUrl).toString('base64');
      const code = 'auth_code_123';

      const result = await controller.saveTokens(code, state);

      expect(getTokensCallbackUseCase.getTokens).toHaveBeenCalledWith(code);
      expect(result).toEqual({
        url: redirectUrl,
        statusCode: 302,
      });
    });

    it('should throw BadRequestException when code is missing', async () => {
      await expect(controller.saveTokens('', 'state')).rejects.toThrow(
        'Code is required',
      );
    });

    it('should handle saveTokens without state', async () => {
      getTokensCallbackUseCase.getTokens.mockResolvedValue(undefined);
      const code = 'auth_code_123';

      const result = await controller.saveTokens(code, '');

      expect(getTokensCallbackUseCase.getTokens).toHaveBeenCalledWith(code);
      expect(result).toEqual({
        url: undefined,
        statusCode: 302,
      });
    });

    it('should handle invalid base64 state gracefully', async () => {
      getTokensCallbackUseCase.getTokens.mockResolvedValue(undefined);
      const code = 'auth_code_123';
      const invalidState = 'not_valid_base64!!!';

      const result = await controller.saveTokens(code, invalidState);

      expect(getTokensCallbackUseCase.getTokens).toHaveBeenCalledWith(code);
      expect(result.statusCode).toBe(302);
      // Invalid base64 returns garbled string, not undefined
      expect(result.url).toBeDefined();
    });

    it('should throw InternalServerErrorException when getTokens fails', async () => {
      getTokensCallbackUseCase.getTokens.mockRejectedValue(
        new Error('Token service error'),
      );
      const code = 'auth_code_123';
      const state = Buffer.from('http://localhost:4200').toString('base64');

      await expect(controller.saveTokens(code, state)).rejects.toThrow(
        'Internal server error',
      );
    });

    it('should handle null code', async () => {
      const result = await expect(
        controller.saveTokens(undefined as any, 'state'),
      ).rejects.toThrow('Code is required');

      expect(result).toBe(undefined);
    });
  });
});
