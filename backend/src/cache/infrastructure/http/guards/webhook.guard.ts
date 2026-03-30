import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { Request } from 'express';

@Injectable()
export class WebhookGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const signature = request.headers['x-callback-signature'] as string;

    if (!signature) throw new UnauthorizedException('Missing signature');

    const secret: string = process.env.SECRET_FOR_SUB || '';

    if (!secret) throw new InternalServerErrorException();

    const expected = createHmac('sha256', secret)
      .update(request.body)
      .digest('base64');

    if (signature !== expected)
      throw new UnauthorizedException('Invalid signature');

    return true;
  }
}
