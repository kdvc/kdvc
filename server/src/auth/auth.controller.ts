import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Authenticated } from './authenticated.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from '../dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['email', 'password'],
    },
  })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback — exchanges code for user' })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Authorization code from Google',
  })
  async googleCallback(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, id_token, refresh_token } =
      await this.authService.authenticateWithGoogle(code);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie('id_token', id_token, cookieOptions);

    if (refresh_token) {
      res.cookie('refresh_token', refresh_token, cookieOptions);
    }

    return user;
  }

  @Get('profile')
  @Authenticated()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
