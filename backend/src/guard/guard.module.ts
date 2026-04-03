import { Module } from '@nestjs/common';
import { AdminGuard } from './admin/admin.guard';
import { UserGuard } from './user/user.guard';
import { JwtModule } from '@nestjs/jwt';

export const JWT_SERVICE = 'JWT_SERVICE';

@Module({
  providers: [UserGuard, AdminGuard],
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_SECRET,
    }),
  ],
  exports: [AdminGuard, UserGuard, JwtModule],
})
export class GuardModule {}
