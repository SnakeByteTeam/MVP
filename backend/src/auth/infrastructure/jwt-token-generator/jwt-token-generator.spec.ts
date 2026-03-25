import { JwtTokenGenerator } from './jwt-token-generator';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtTokenGenerator', () => {
  let generator: JwtTokenGenerator;
  const payload = { id: 1, role: "admin" };

  beforeEach(() => {
    process.env.ACCESS_SECRET = 'access-secret';
    process.env.REFRESH_SECRET = 'refresh-secret';
    generator = new JwtTokenGenerator();
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generator.generateAccessToken(payload);

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
        generator.extractAccessTokenPayload('invalid-token')
      ).toThrow(UnauthorizedException);
    });

    it('should throw for invalid refresh token', () => {
      expect(() =>
        generator.extractRefreshTokenPayload('invalid-token')
      ).toThrow(UnauthorizedException);
    });

    it('should throw if access token is signed with different secret', () => {
      const token = generator.generateAccessToken(payload);

      process.env.ACCESS_SECRET = 'different-secret';

      expect(() =>
        generator.extractAccessTokenPayload(token)
      ).toThrow(UnauthorizedException);
    });

    it('should throw if refresh token is signed with different secret', () => {
      const token = generator.generateRefreshToken(payload);

      process.env.REFRESH_SECRET = 'different-secret';

      expect(() =>
        generator.extractRefreshTokenPayload(token)
      ).toThrow(UnauthorizedException);
    });
  });
});