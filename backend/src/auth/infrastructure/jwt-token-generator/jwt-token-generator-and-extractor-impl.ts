import { UnauthorizedException } from '@nestjs/common';
import { Payload } from '../../domain/payload';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenGeneratorAndExtractor } from 'src/auth/application/token/jwt-token-generator-and-extractor.interface';

export class JwtTokenGeneratorAndExtractorImpl
  implements
    JwtTokenGeneratorAndExtractor
{
  private readonly jwtService = new JwtService();

  private sanitizePayload(payload: Payload): Payload {
    const { exp, iat, nbf, ...claims } = payload as Payload & {
      exp?: number;
      iat?: number;
      nbf?: number;
    };

    return claims as Payload;
  }

  generateChangePasswordAccessToken(payload: Payload): string {
    return this.jwtService.sign(this.sanitizePayload(payload), {
      secret: process.env.ACCESS_SECRET,
      expiresIn: '5m',
    });
  }
  generateChangePasswordRefreshToken(payload: Payload): string {
    return this.jwtService.sign(this.sanitizePayload(payload), {
      secret: process.env.REFRESH_SECRET,
      expiresIn: '1h',
    });
  }
  generateAccessToken(payload: Payload): string {
    return this.jwtService.sign(this.sanitizePayload(payload), {
      secret: process.env.ACCESS_SECRET,
      expiresIn: '10m',
    });
  }
  generateRefreshToken(payload: Payload): string {
    return this.jwtService.sign(this.sanitizePayload(payload), {
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

export const JWT_TOKEN_GENERATOR_AND_EXTRACTOR_IMPL = 'JWT_TOKEN_GENERATOR_AND_EXTRACTOR_IMPL';
