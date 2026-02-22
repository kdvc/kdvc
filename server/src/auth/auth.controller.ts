import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Authenticated } from './authenticated.decorator';
import { AuthService } from './auth.service';
import { GoogleLoginDto, LoginDto, RefreshTokenDto } from '../dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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

  @Get('me')
  @Authenticated()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req: Request) {
    const user = req.user as any;
    if (user) {
      const { password, ...rest } = user;
      return rest;
    }
    return user;
  }

  @Post('google/login')
  @ApiOperation({
    summary:
      'Login with a Google id_token (from mobile) — returns internal JWT tokens',
  })
  async googleLogin(@Req() req: Request, @Body() body: GoogleLoginDto) {
    // Prefer Authorization header, fallback to body
    const authHeader = req.headers.authorization;
    let idToken: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      idToken = authHeader.slice(7);
    } else if (body.idToken) {
      idToken = body.idToken;
    }

    if (!idToken) {
      throw new UnauthorizedException(
        'id_token must be provided via Authorization Bearer header or request body',
      );
    }

    return this.authService.loginWithGoogleIdToken(idToken);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Exchange a refresh token for a new access token' })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshAccessToken(body.refresh_token);
  }
}
