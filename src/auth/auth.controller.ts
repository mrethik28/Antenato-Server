import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto';
import { Tokens } from './types/tokens.type';
import { ATGaurd, RTGaurd } from 'src/common/gaurds';
import { GetCurrentUser, Public } from 'src/common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('/local/signup')
  localSignUp(@Body() dto: AuthDTO): Promise<Tokens> {
    return this.authService.localSingUp(dto);
  }
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/local/signin')
  localSignIn(@Body() dto: AuthDTO) {
    return this.authService.localSingIn(dto);
  }

  @UseGuards(ATGaurd)
  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  logout(@GetCurrentUser() userId: number): Promise<string> {
    return this.authService.logout(userId);
  }

  @UseGuards(RTGaurd)
  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  refresh(@GetCurrentUser() user: any): Promise<Tokens> {
    return this.authService.refresh(user);
  }
}
