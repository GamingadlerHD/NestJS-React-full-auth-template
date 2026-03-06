import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PassportAuthController } from './passport-auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
  controllers: [PassportAuthController],
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],

      useFactory: (configService: ConfigService): JwtModuleOptions => {
        return {
          global: true,
          secret:
            configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
          signOptions: {
            expiresIn: (configService.get('JWT_EXPIRES_IN') || '10s') as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class AuthModule {}
