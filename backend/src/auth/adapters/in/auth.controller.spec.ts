import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { 
  LOGIN_USE_CASE, 
  REFRESH_USE_CASE, 
  LOGOUT_USE_CASE 
} from '../../application/services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockLoginUseCase = {
    login: jest.fn(),
  };

  const mockRefreshUseCase = {
    refresh: jest.fn(),
  };

  const mockLogoutUseCase = {
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: LOGIN_USE_CASE, useValue: mockLoginUseCase },
        { provide: REFRESH_USE_CASE, useValue: mockRefreshUseCase },
        { provide: LOGOUT_USE_CASE, useValue: mockLogoutUseCase },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call login use case and return LoginResDto', () => {
    const tokens = { accessToken: 'a', refreshToken: 'r' };

    mockLoginUseCase.login.mockReturnValue(tokens);

    const result = controller.login({
      username: 'user',
      password: 'pass',
    });

    expect(mockLoginUseCase.login).toHaveBeenCalled();

    expect(result).toEqual({
      accessToken: 'a',
      refreshToken: 'r',
    });
  });

  it('should call refresh use case and return RefreshResDto', () => {
    mockRefreshUseCase.refresh.mockReturnValue('nat');

    const result = controller.refresh({
      refreshToken: 'at',
    });

    expect(mockRefreshUseCase.refresh).toHaveBeenCalled();

    expect(result).toEqual({
      refreshToken: 'nat',
    });
  });

  it('should call logout use case', () => {
    mockLogoutUseCase.logout.mockReturnValue(undefined);

    const result = controller.logout();

    expect(mockLogoutUseCase.logout).toHaveBeenCalled();

    expect(result).toBeUndefined();
  });
});