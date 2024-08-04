import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RTStrategy } from './strategies/rt.strategy';
import { ATStrategy } from './strategies/at.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, RTStrategy, ATStrategy],
})
export class AuthModule {}
