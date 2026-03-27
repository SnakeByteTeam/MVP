import { UnauthorizedException } from '@nestjs/common';
import { JwtAccessTokenExtractor } from '../../application/token/jwt-access-token-extractor.interface';
import { JwtAccessTokenGenerator } from '../../application/token/jwt-access-token-generator.interface';
import { JwtRefreshTokenExtractor } from '../../application/token/jwt-refresh-token-extractor.interface';
import { JwtRefreshTokenGenerator } from '../../application/token/jwt-refresh-token-generator.interface';
import { Payload } from '../../domain/payload';
import { JwtService } from '@nestjs/jwt';
import { JwtChangePasswordAccessTokenGenerator } from '../../application/token/jwt-change-password-access-token-generator.interface';
import { JwtChangePasswordRefreshTokenGenerator } from '../../application/token/jwt-change-password-refresh-token-generator.interface';

export class JwtTokenGenerator
  implements
    JwtAccessTokenGenerator,
    JwtRefreshTokenGenerator,
    JwtAccessTokenExtractor,
    JwtRefreshTokenExtractor,
    JwtChangePasswordAccessTokenGenerator,
    JwtChangePasswordRefreshTokenGenerator
{
  private jwtService = new JwtService();

  generateChangePasswordAccessToken(payload: Payload): string {
    return this.jwtService.sign(JSON.parse(JSON.stringify(payload)), {
      secret: process.env.ACCESS_SECRET,
      expiresIn: '5m',
    });
  }
  generateChangePasswordRefreshToken(payload: Payload): string {
    return this.jwtService.sign(JSON.parse(JSON.stringify(payload)), {
      secret: process.env.REFRESH_SECRET,
      expiresIn: '1h',
    });
  }
  generateAccessToken(payload: Payload): string {
    return this.jwtService.sign(JSON.parse(JSON.stringify(payload)), {
      secret: process.env.ACCESS_SECRET,
      expiresIn: '10m',
    });
  }
  generateRefreshToken(payload: Payload): string {
    return this.jwtService.sign(JSON.parse(JSON.stringify(payload)), {
      secret: process.env.REFRESH_SECRET,
      expiresIn: '7d',
    });
  }
  extractAccessTokenPayload(token: string): Payload {
    try {
      return this.jwtService.verify<Payload>(token, {
        secret: process.env.ACCESS_SECRET,
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  extractRefreshTokenPayload(token: string): Payload {
    try {
      return this.jwtService.verify<Payload>(token, {
        secret: process.env.REFRESH_SECRET,
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}

export const JWT_CHANGE_PASSWORD_ACCESS_TOKEN_GENERATOR =
  'JWT_CHANGE_PASSWORD_ACCESS_TOKEN_GENERATOR';
export const JWT_CHANGE_PASSWORD_REFRESH_TOKEN_GENERATOR =
  'JWT_CHANGE_PASSWORD_REFRESH_TOKEN_GENERATOR';
export const JWT_ACCESS_TOKEN_GENERATOR = 'JWT_ACCESS_TOKEN_GENERATOR';
export const JWT_REFRESH_TOKEN_GENERATOR = 'JWT_REFRESH_TOKEN_GENERATOR';
export const JWT_ACCESS_TOKEN_EXTRACTOR = 'JWT_ACCESS_TOKEN_EXTRACTOR';
export const JWT_REFRESH_TOKEN_EXTRACTOR = 'JWT_REFRESH_TOKEN_EXTRACTOR';
