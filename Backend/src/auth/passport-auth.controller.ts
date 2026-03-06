import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportLocalGuard } from './guards/passport-local.guard';
import { PassportJwtAuthGuard } from './guards/passport-jwt.guard';
import { PassportJwtRefreshGuard } from './guards/passport-jwt-refresh.guard';

@Controller('auth')
export class PassportAuthController {
  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(PassportLocalGuard)
  async login(@Request() req, @Response({ passthrough: true }) res) {
    const result = await this.authService.signIn(req.user);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
    });
    return { accessToken: result.accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @UseGuards(PassportJwtRefreshGuard)
  async refresh(@Request() req, @Response({ passthrough: true }) res) {
    const result = await this.authService.signIn(req.user);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
    });
    return { accessToken: result.accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Response({ passthrough: true }) res) {
    res.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(PassportJwtAuthGuard)
  getUserInfo(@Request() request) {
    return request.user;
  }
}
