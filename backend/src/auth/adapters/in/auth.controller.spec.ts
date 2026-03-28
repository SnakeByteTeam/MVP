import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import {
  FIRST_LOGIN_USE_CASE,
  LOGIN_USE_CASE,
  REFRESH_USE_CASE,
} from '../../application/services/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;

  const mockLoginUseCase = {
    login: jest.fn(),
  };

  const mockFirstLoginUseCase = {
    firstLogin: jest.fn(),
  };

  const mockRefreshUseCase = {
    refresh: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: LOGIN_USE_CASE, useValue: mockLoginUseCase },
        { provide: REFRESH_USE_CASE, useValue: mockRefreshUseCase },
        { provide: FIRST_LOGIN_USE_CASE, useValue: mockFirstLoginUseCase },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('first-login: should call firstLogin use case, set cookie and return FirstLoginResDto', async () => {
    const tokens = { accessToken: 'fa', refreshToken: 'fr' };
    mockFirstLoginUseCase.firstLogin.mockResolvedValue(tokens);

    const mockRes: any = {
      cookie: jest.fn(),
    };

    const reqBody: any = {
      username: 'user',
      password: 'pass',
      tempPassword: 'tmp',
    };

    const result = await controller.firstLogin(reqBody, mockRes as any);

    expect(mockFirstLoginUseCase.firstLogin).toHaveBeenCalled();
    expect(mockRes.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'fr',
      expect.any(Object),
    );
    expect(result).toEqual({ accessToken: 'fa' });
  });

  it('login: should call login use case, set cookie and return LoginResDto', async () => {
    const tokens = { accessToken: 'a', refreshToken: 'r' };
    mockLoginUseCase.login.mockResolvedValue(tokens);

    const mockRes: any = {
      cookie: jest.fn(),
    };

    const result = await controller.login(
      { username: 'user', password: 'pass' } as any,
      mockRes as any,
    );

    expect(mockLoginUseCase.login).toHaveBeenCalled();
    expect(mockRes.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'r',
      expect.any(Object),
    );
    expect(result).toEqual({ accessToken: 'a' });
  });

  it('refresh: should call refresh use case and return RefreshResDto', async () => {
    mockRefreshUseCase.refresh.mockResolvedValue('nat');

    const mockReq: any = {
      cookies: { refreshToken: 'at' },
    };

    const result = await controller.refresh(mockReq as any);

    expect(mockRefreshUseCase.refresh).toHaveBeenCalled();
    expect(result).toEqual({ accessToken: 'nat' });
  });

  it('refresh: should throw UnauthorizedException when refresh cookie is missing', async () => {
    const mockReq: any = {};
    await expect(controller.refresh(mockReq as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('logout: should clear cookie', () => {
    const mockRes: any = {
      clearCookie: jest.fn(),
    };

    const result = controller.logout(mockRes as any);

    expect(mockRes.clearCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.any(Object),
    );
    expect(result).toEqual({ success: true });
  });
});
