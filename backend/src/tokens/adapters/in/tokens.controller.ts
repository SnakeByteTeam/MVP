import {
  Controller,
  Get,
  Inject,
  Query,
  BadRequestException,
  InternalServerErrorException,
  Redirect,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiFoundResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  GETTOKENSCALLBACKUSECASE,
  type GetTokensCallbackUseCase,
} from 'src/tokens/application/ports/in/get-tokens.usecase';

@ApiTags('tokens')
@Controller('tokens')
export class TokensController {
  constructor(
    @Inject(GETTOKENSCALLBACKUSECASE)
    private readonly getTokensCallbackUseCase: GetTokensCallbackUseCase,
  ) {}

  @Get('callback')
  @Redirect()
  @ApiOperation({
    summary: 'Handle OAuth callback and redirect to frontend',
    description:
      'Expected query parameter: code. Returned payload: redirect url and statusCode 302.',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    type: String,
    description: 'Authorization code returned by OAuth provider.',
    example: 'AQABAAIAAAA...',
  })
  @ApiFoundResponse({
    description:
      'Tokens saved successfully and user redirected to frontend success page.',
    schema: {
      example: {
        statusCode: 302,
        url: 'http://localhost:4200/my-vimar?linked=ok',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request. Query parameter `code` is missing.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Code is required',
        error: 'Bad Request',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error while exchanging code for tokens.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
    },
  })
  async getTokens(@Query('code') code: string) {
    if (!code) {
      throw new BadRequestException('Code is required');
    }
    try {
      await this.getTokensCallbackUseCase.getTokens(code);
      return {
        url: `${process.env.FRONTEND_URL}/my-vimar?linked=ok`,
        statusCode: 302,
      };
    } catch {
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
