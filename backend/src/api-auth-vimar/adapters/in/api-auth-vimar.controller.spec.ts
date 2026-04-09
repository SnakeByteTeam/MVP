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
  GET_ACCOUNT_STATUS_USECASE,
  type GetAccountStatusUseCase,
} from 'src/api-auth-vimar/application/ports/in/get-account-status.usecase';
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
  let getAccountStatusUseCase: jest.Mocked<GetAccountStatusUseCase>;
  let deleteTokensFromRepo: jest.Mocked<DeleteTokensFromRepoPort>;

  beforeEach(async () => {
    apiAuthUseCase = {
      getLoginUrl: jest.fn(),
    };
    getTokensCallbackUseCase = {
      getTokens: jest.fn(),
    };

    getAccountStatusUseCase = {
      getAccountStatus: jest.fn(),
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
          provide: GET_ACCOUNT_STATUS_USECASE,
          useValue: getAccountStatusUseCase,
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

  describe('getAccountStatus', () => {
    it('should return linked=true when a valid token is available', async () => {
      getAccountStatusUseCase.getAccountStatus.mockResolvedValue({
        isLinked: true,
        email: 'utente@example.com',
      });

      const result = await controller.getAccountStatus({ user: { id: 7 } });

      expect(getAccountStatusUseCase.getAccountStatus).toHaveBeenCalledTimes(1);
      expect(getAccountStatusUseCase.getAccountStatus).toHaveBeenCalledWith(7);
      expect(result).toEqual({
        isLinked: true,
        email: 'utente@example.com',
      });
    });

    it('should return linked=false when token is not available', async () => {
      getAccountStatusUseCase.getAccountStatus.mockRejectedValue(
        new Error('No tokens found in cache'),
      );

      const result = await controller.getAccountStatus({ user: { id: 7 } });

      expect(getAccountStatusUseCase.getAccountStatus).toHaveBeenCalledTimes(1);
      expect(getAccountStatusUseCase.getAccountStatus).toHaveBeenCalledWith(7);
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
      const state = Buffer.from(
        JSON.stringify({ redirectUrl, userId: 7 }),
      ).toString('base64');
      const code = 'auth_code_123';

      const result = await controller.saveTokens(code, state);

      expect(getTokensCallbackUseCase.getTokens).toHaveBeenCalledWith(code, 7);
      expect(result).toEqual({
        url: redirectUrl,
        statusCode: 302,
      });
    });

    it('should decode redirect URL from JSON encoded state', async () => {
      getTokensCallbackUseCase.getTokens.mockResolvedValue(undefined);

      const redirectUrl = 'http://localhost:4200/dashboard';
      const state = Buffer.from(
        JSON.stringify({ redirectUrl, userId: 7 }),
      ).toString('base64');

      const result = await controller.saveTokens('auth_code_123', state);

      expect(getTokensCallbackUseCase.getTokens).toHaveBeenCalledWith(
        'auth_code_123',
        7,
      );
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

    it('should throw BadRequestException when state is missing', async () => {
      getTokensCallbackUseCase.getTokens.mockResolvedValue(undefined);

      await expect(controller.saveTokens('auth_code_123', '')).rejects.toThrow(
        'State is required',
      );

      expect(getTokensCallbackUseCase.getTokens).toHaveBeenCalledTimes(0);
    });

    it('should throw BadRequestException when state is not valid base64/json', async () => {
      getTokensCallbackUseCase.getTokens.mockResolvedValue(undefined);

      await expect(
        controller.saveTokens('auth_code_123', 'not_valid_base64!!!'),
      ).rejects.toThrow('Invalid state format');

      expect(getTokensCallbackUseCase.getTokens).toHaveBeenCalledTimes(0);
    });

    it('should throw BadRequestException when state has no redirectUrl', async () => {
      const state = Buffer.from(JSON.stringify({ userId: 12 })).toString(
        'base64',
      );

      await expect(
        controller.saveTokens('auth_code_123', state),
      ).rejects.toThrow('State must contain redirectUrl as string');
      expect(getTokensCallbackUseCase.getTokens).toHaveBeenCalledTimes(0);
    });

    it('should throw BadRequestException when state has no userId', async () => {
      const state = Buffer.from(
        JSON.stringify({ redirectUrl: 'http://localhost:4200/dashboard' }),
      ).toString('base64');

      await expect(
        controller.saveTokens('auth_code_123', state),
      ).rejects.toThrow('State must contain userId as string or number');
      expect(getTokensCallbackUseCase.getTokens).toHaveBeenCalledTimes(0);
    });

    it('should throw InternalServerErrorException when getTokens fails', async () => {
      getTokensCallbackUseCase.getTokens.mockRejectedValue(
        new Error('Token service error'),
      );
      const code = 'auth_code_123';
      const state = Buffer.from(
        JSON.stringify({
          redirectUrl: 'http://localhost:4200',
          userId: 1,
        }),
      ).toString('base64');

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
