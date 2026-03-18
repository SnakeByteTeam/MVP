import { Test, TestingModule } from '@nestjs/testing';
import { TokensController } from './tokens.controller';
import {
  GETTOKENSCALLBACKUSECASE,
  type GetTokensCallbackUseCase,
} from 'src/tokens/application/ports/in/get-tokens.usecase';

describe('TokensController', () => {
  let controller: TokensController;
  let getTokensCallbackUseCase: jest.Mocked<GetTokensCallbackUseCase>;

  beforeEach(async () => {
    getTokensCallbackUseCase = {
      getTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokensController],
      providers: [
        {
          provide: GETTOKENSCALLBACKUSECASE,
          useValue: getTokensCallbackUseCase,
        },
      ],
    }).compile();

    controller = module.get<TokensController>(TokensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate token retrieval to the use case', async () => {
    getTokensCallbackUseCase.getTokens.mockResolvedValue(undefined);

    await controller.getTokens('auth-code');

    expect(getTokensCallbackUseCase.getTokens).toHaveBeenCalledWith('auth-code');
    expect(getTokensCallbackUseCase.getTokens).toHaveBeenCalledTimes(1);
  });
});
