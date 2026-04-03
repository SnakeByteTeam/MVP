import { FirstLoginGuard } from './first-login.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('FirstLoginGuard', () => {
  it('should be defined', () => {
    expect(new FirstLoginGuard()).toBeDefined();
  });

  it('allows when Authorization Bearer token has payload.firstAccess === true', () => {
    const guard = new FirstLoginGuard();
    (guard as any).jwtService = {
      verify: jest.fn().mockReturnValue({ firstAccess: true }),
    };

    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer token' } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
    expect((guard as any).jwtService.verify).toHaveBeenCalledWith('token', {
      secret: process.env.ACCESS_SECRET,
    });
  });

  it('throws UnauthorizedException when Authorization header is missing', () => {
    const guard = new FirstLoginGuard();
    (guard as any).jwtService = { verify: jest.fn() };

    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when Authorization header is malformed', () => {
    const guard = new FirstLoginGuard();
    (guard as any).jwtService = { verify: jest.fn() };

    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'BadHeader' } }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when token is invalid (verify throws)', () => {
    const guard = new FirstLoginGuard();
    (guard as any).jwtService = {
      verify: jest.fn().mockImplementation(() => {
        throw new Error('invalid');
      }),
    };

    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer bad' } }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when payload.firstAccess !== true', () => {
    const guard = new FirstLoginGuard();
    (guard as any).jwtService = {
      verify: jest.fn().mockReturnValue({ firstAccess: false }),
    };

    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer token' } }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
