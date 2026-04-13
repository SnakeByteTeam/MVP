import { JwtTokenGeneratorAndExtractorImpl } from 'src/auth/infrastructure/jwt-token-generator/jwt-token-generator-and-extractor-impl';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtTokenGenerator', () => {
  let generator: JwtTokenGeneratorAndExtractorImpl;
  const payload = {
    id: 1,
    username: 'user',
    role: 'OPERATORE_SANITARIO',
    firstAccess: false,
  };

  beforeEach(() => {
    process.env.ACCESS_SECRET = 'access-secret';
    process.env.REFRESH_SECRET = 'refresh-secret';
    generator = new JwtTokenGeneratorAndExtractorImpl();
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generator.generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should generate access token even when payload already contains exp/iat', () => {
      const payloadWithJwtClaims = {
        ...payload,
        exp: Math.floor(Date.now() / 1000) + 60,
        iat: Math.floor(Date.now() / 1000),
      };

      const token = generator.generateAccessToken(payloadWithJwtClaims as any);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generator.generateRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('change-password tokens', () => {
    const cpPayload = {
      id: 2,
      username: 'user2',
      role: 'OPERATORE_SANITARIO',
      firstAccess: true,
    };

    it('should generate a valid change-password access token', () => {
      const token = generator.generateChangePasswordAccessToken(cpPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should generate a valid change-password refresh token', () => {
      const token = generator.generateChangePasswordRefreshToken(cpPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should round-trip change-password access token payload', () => {
      const token = generator.generateChangePasswordAccessToken(cpPayload);
      const decoded = generator.extractAccessTokenPayload(token);
      expect(decoded.id).toBe(cpPayload.id);
      expect(decoded.firstAccess).toBe(cpPayload.firstAccess);
    });

    it('should round-trip change-password refresh token payload', () => {
      const token = generator.generateChangePasswordRefreshToken(cpPayload);
      const decoded = generator.extractRefreshTokenPayload(token);
      expect(decoded.id).toBe(cpPayload.id);
      expect(decoded.firstAccess).toBe(cpPayload.firstAccess);
    });

    it('should throw if change-password access token signed with different secret', () => {
      const token = generator.generateChangePasswordAccessToken(cpPayload);
      process.env.ACCESS_SECRET = 'other-secret';
      expect(() => generator.extractAccessTokenPayload(token)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if change-password refresh token signed with different secret', () => {
      const token = generator.generateChangePasswordRefreshToken(cpPayload);
      process.env.REFRESH_SECRET = 'other-secret';
      expect(() => generator.extractRefreshTokenPayload(token)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('access token round-trip', () => {
    it('should generate and extract access token payload', () => {
      const token = generator.generateAccessToken(payload);
      const decoded = generator.extractAccessTokenPayload(token);

      expect(decoded.id).toBe(payload.id);
    });
  });

  describe('refresh token round-trip', () => {
    it('should generate and extract refresh token payload', () => {
      const token = generator.generateRefreshToken(payload);
      const decoded = generator.extractRefreshTokenPayload(token);

      expect(decoded.id).toBe(payload.id);
    });
  });

  describe('error handling', () => {
    it('should throw for invalid access token', () => {
      expect(() =>
        generator.extractAccessTokenPayload('invalid-token'),
      ).toThrow(UnauthorizedException);
    });

    it('should throw for invalid refresh token', () => {
      expect(() =>
        generator.extractRefreshTokenPayload('invalid-token'),
      ).toThrow(UnauthorizedException);
    });

    it('should throw if access token is signed with different secret', () => {
      const token = generator.generateAccessToken(payload);

      process.env.ACCESS_SECRET = 'different-secret';

      expect(() => generator.extractAccessTokenPayload(token)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if refresh token is signed with different secret', () => {
      const token = generator.generateRefreshToken(payload);

      process.env.REFRESH_SECRET = 'different-secret';

      expect(() => generator.extractRefreshTokenPayload(token)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
