import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Res,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setCookie(res: Response, refreshToken: string) {
    const isProduction = this.configService.get<string>('app.nodeEnv') === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
  }

  private clearCookie(res: Response) {
    const isProduction = this.configService.get<string>('app.nodeEnv') === 'production';
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
    });
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify account registration OTP code' })
  @ApiResponse({ status: 200, description: 'Account successfully activated' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setCookie(res, result.refreshToken);
    
    // We do NOT return refresh token inside the JSON payload to the client!
    const { refreshToken, ...responsePayload } = result;
    return responsePayload;
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refresh(
    @CurrentUser() session: { userId: string; email: string; refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    // In real RTR, raw token is passed as `session.refreshToken`
    const role = 'CUSTOMER'; // Strategy does not require role resolve for RTR
    const tokens = await this.authService.refresh(
      session.userId,
      session.email,
      role,
      session.refreshToken,
    );

    this.setCookie(res, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user session' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @CurrentUser() currentUser: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = req.cookies?.['refreshToken'];
    if (rawRefreshToken) {
      await this.authService.logout(currentUser.id, rawRefreshToken);
    }
    this.clearCookie(res);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile session details' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async me(@CurrentUser() currentUser: User) {
    return currentUser;
  }
}
