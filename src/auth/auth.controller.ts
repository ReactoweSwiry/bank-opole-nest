import { Controller, Post, Body, Req, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';

import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Request } from 'express';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RolesGuard } from './guards/roles.guard';

import { ROLES } from './decorators/roles.decorator';
import { Role } from 'src/enums/roles.enum';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Post('register')
  signUp(@Body() dto: CreateUserDto) {
    return this.authService.signUp(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  signOut(@Req() req: Request) {
    this.authService.signOut(req.user['subscriber']);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @ROLES(Role.Admin) //Only admin should access
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    const userId = req.user['subscriber'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
