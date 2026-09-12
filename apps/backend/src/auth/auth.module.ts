import { GroupAccessModule } from '../group-access/group-access.module';
import { AuthCallbackFilter } from './auth-callback.filter';
import { AuthSchDedupGuard } from './authsch-dedup.guard';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSchStrategy } from './authsch.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    GroupAccessModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [AuthService, AuthSchStrategy, JwtStrategy, AuthCallbackFilter, AuthSchDedupGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
