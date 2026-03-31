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
import { PlantAuthDto } from 'src/api-auth-vimar/infrastructure/dto/plant-auth.dto';

describe('ApiAuthVimarController', () => {
  let controller: ApiAuthVimarController;
  let apiAuthUseCase: jest.Mocked<ApiAuthUseCase>;
  let getTokensCallbackUseCase: jest.Mocked<GetTokensCallbackUseCase>;

  beforeEach(async () => {
    apiAuthUseCase = {
      getLoginUrl: jest.fn(),
    };

    getTokensCallbackUseCase = {
      getTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
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
});
