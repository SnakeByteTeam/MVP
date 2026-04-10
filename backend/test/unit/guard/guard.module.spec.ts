import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { JwtModule } from '@nestjs/jwt';
import { AdminGuard } from 'src/guard/admin/admin.guard';
import { UserGuard } from 'src/guard/user/user.guard';
import { GuardModule, JWT_SERVICE } from 'src/guard/guard.module';

describe('GuardModule', () => {
  it('espone il token JWT_SERVICE', () => {
    expect(JWT_SERVICE).toBe('JWT_SERVICE');
  });

  it('dichiara providers e exports attesi', () => {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, GuardModule) as unknown[];
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, GuardModule) as unknown[];
    const exports = Reflect.getMetadata(MODULE_METADATA.EXPORTS, GuardModule) as unknown[];

    expect(providers).toContain(UserGuard);
    expect(providers).toContain(AdminGuard);
    expect(imports).toHaveLength(1);
    expect(exports).toContain(AdminGuard);
    expect(exports).toContain(UserGuard);
    expect(exports).toContain(JwtModule);
  });
});
