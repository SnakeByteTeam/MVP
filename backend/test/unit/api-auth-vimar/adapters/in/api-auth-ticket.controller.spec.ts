import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiAuthTicketController } from 'src/api-auth-vimar/adapters/in/api-auth-ticket.controller';
import {
  PREPAREOAUTHUSECASE,
  type PrepareOAuthUseCase,
} from 'src/api-auth-vimar/application/ports/in/prepare-oauth.usecase';
import {
  AUTHORIZEOAUTHUSECASE,
  type AuthorizeOAuthUseCase,
} from 'src/api-auth-vimar/application/ports/in/authorize-oauth.usecase';
import {
  APIAUTHUSECASE,
  type ApiAuthUseCase,
} from 'src/api-auth-vimar/application/ports/in/api-auth.usecase';
import { GuardModule } from 'src/guard/guard.module';
import { AdminGuard } from 'src/guard/admin/admin.guard';

describe('ApiAuthTicketController', () => {
  let controller: ApiAuthTicketController;
  let prepareOAuthUseCase: jest.Mocked<PrepareOAuthUseCase>;
  let authorizeOAuthUseCase: jest.Mocked<AuthorizeOAuthUseCase>;
  let apiAuthUseCase: jest.Mocked<ApiAuthUseCase>;

  beforeEach(async () => {
    prepareOAuthUseCase = {
      prepareOAuth: jest.fn(),
    };

    authorizeOAuthUseCase = {
      authorizeOAuth: jest.fn(),
    };

    apiAuthUseCase = {
      getLoginUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [GuardModule],
      controllers: [ApiAuthTicketController],
      providers: [
        {
          provide: PREPAREOAUTHUSECASE,
          useValue: prepareOAuthUseCase,
        },
        {
          provide: AUTHORIZEOAUTHUSECASE,
          useValue: authorizeOAuthUseCase,
        },
        {
          provide: APIAUTHUSECASE,
          useValue: apiAuthUseCase,
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

    controller = module.get<ApiAuthTicketController>(ApiAuthTicketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('prepareOAuth', () => {
    it('should create and return ticket for authenticated user', async () => {
      prepareOAuthUseCase.prepareOAuth.mockResolvedValue('ticket-123');

      const req = {
        user: { id: 5 },
      } as any;

      const result = await controller.prepareOAuth(req);

      expect(result).toEqual({ ticket: 'ticket-123' });
      expect(prepareOAuthUseCase.prepareOAuth).toHaveBeenCalledTimes(1);
      expect(prepareOAuthUseCase.prepareOAuth).toHaveBeenCalledWith(5);
    });

    it('should throw UnauthorizedException when request has no user id', async () => {
      const req = {
        user: {},
      } as any;

      await expect(controller.prepareOAuth(req)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prepareOAuthUseCase.prepareOAuth).toHaveBeenCalledTimes(0);
    });
  });

  describe('authorize', () => {
    it('should consume ticket and redirect to provider login URL', async () => {
      authorizeOAuthUseCase.authorizeOAuth.mockResolvedValue(77);
      apiAuthUseCase.getLoginUrl.mockReturnValue(
        'https://oauth.provider/authorize',
      );

      const result = await controller.authorize(
        'ticket-123',
        'http://localhost:4200/vimar-link',
      );

      expect(authorizeOAuthUseCase.authorizeOAuth).toHaveBeenCalledTimes(1);
      expect(authorizeOAuthUseCase.authorizeOAuth).toHaveBeenCalledWith(
        'ticket-123',
      );
      expect(apiAuthUseCase.getLoginUrl).toHaveBeenCalledTimes(1);

      const stateArg = apiAuthUseCase.getLoginUrl.mock.calls[0][0] as string;
      const decodedState = JSON.parse(
        Buffer.from(stateArg, 'base64').toString('utf-8'),
      );

      expect(decodedState).toEqual({
        redirectUrl: 'http://localhost:4200/vimar-link',
        userId: 77,
      });

      expect(result).toEqual({
        url: 'https://oauth.provider/authorize',
        statusCode: 302,
      });
    });

    it('should throw UnauthorizedException when ticket is invalid', async () => {
      authorizeOAuthUseCase.authorizeOAuth.mockResolvedValue(null);

      await expect(
        controller.authorize(
          'invalid-ticket',
          'http://localhost:4200/vimar-link',
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(apiAuthUseCase.getLoginUrl).toHaveBeenCalledTimes(0);
    });

    it('should throw BadRequestException when redirect_url is missing', async () => {
      await expect(controller.authorize('ticket-123', '')).rejects.toThrow(
        BadRequestException,
      );

      expect(authorizeOAuthUseCase.authorizeOAuth).toHaveBeenCalledTimes(0);
      expect(apiAuthUseCase.getLoginUrl).toHaveBeenCalledTimes(0);
    });
  });
});
