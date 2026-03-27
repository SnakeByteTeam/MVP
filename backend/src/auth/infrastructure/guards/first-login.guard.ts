import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Payload } from '../../domain/payload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class FirstLoginGuard implements CanActivate {

  constructor() {}

  private jwtService = new JwtService();

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    const token = parts[1];
    try {
      const payload: Payload = this.jwtService.verify(token, {
        secret: process.env.ACCESS_SECRET
      });
      if (payload && payload.firstAccess === true) {
        // (req as any).user = payload;
        return true;
      }
      throw new UnauthorizedException('You are not allowed to access this resource');
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
