import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader =
      req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    const token = parts[1];
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.ACCESS_SECRET,
      });
      if (payload) {
        if (payload.role === 'Amministratore') {
          return true;
        }
      }
      throw new UnauthorizedException(
        'You must be an administrator to access this resource',
      );
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
