import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSchStrategy } from './authsch.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [ConfigModule, PassportModule, JwtModule.register({}), UsersModule],
  providers: [AuthService, AuthSchStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
