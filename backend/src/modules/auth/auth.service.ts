import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { OtpCode } from './entities/otp-code.entity';
import { LoyaltyTransaction } from '../users/entities/loyalty-transaction.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,
    @InjectRepository(OtpCode)
    private otpCodesRepository: Repository<OtpCode>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    return this.dataSource.transaction(async (manager) => {
      // Get or create standard CUSTOMER role
      const customerRole = await this.usersService.getOrCreateRole('CUSTOMER', [
        'READ_PRODUCTS',
        'CREATE_ORDERS',
        'READ_ORDERS',
      ]);

      const hashedPassword = await bcrypt.hash(dto.password, 12);
      
      const user = manager.create(User, {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        roleId: customerRole.id,
        isActive: false, // Must verify OTP first
      });
      const savedUser = await manager.save(user);

      // Generate a 6-digit numeric OTP code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5-minute validity

      const otp = manager.create(OtpCode, {
        code,
        type: 'REGISTER',
        expiresAt,
        userId: savedUser.id,
      });
      await manager.save(otp);

      // In real production, trigger SMS/Email. For local sandbox, log to console:
      console.log(`\n==========================================`);
      console.log(`🔥 [OTP CODE] Registered User: ${dto.email}`);
      console.log(`🔐 OTP Code: ${code} (Expires in 5 minutes)`);
      console.log(`==========================================\n`);

      return {
        userId: savedUser.id,
        email: savedUser.email,
        message: 'Registration successful. Please verify OTP code sent to your console.',
      };
    });
  }

  async verifyOtp(dto: VerifyOtpDto) {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: dto.userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isActive) {
        throw new BadRequestException('User is already activated');
      }

      const otp = await manager.findOne(OtpCode, {
        where: { userId: dto.userId, code: dto.code, isUsed: false },
      });

      if (!otp) {
        throw new BadRequestException('Invalid OTP code');
      }

      if (new Date() > otp.expiresAt) {
        throw new BadRequestException('OTP code has expired');
      }

      // Mark OTP as used
      otp.isUsed = true;
      await manager.save(otp);

      // Activate user
      user.isActive = true;
      user.loyaltyPoints = 100; // Welcome 100 loyalty points!
      await manager.save(user);

      // Log loyalty transaction
      const transaction = manager.create(LoyaltyTransaction, {
        userId: user.id,
        points: 100,
        description: 'Onboarding Welcome Reward Points',
      });
      await manager.save(transaction);

      return {
        success: true,
        message: 'Account activated successfully. Welcome to Express Cafe! ☕',
      };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'password', 'name', 'isActive', 'roleId'],
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password || '');
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Please verify your OTP code to activate your account');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role?.name || 'CUSTOMER');
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Strip password from returned payload
    delete user.password;

    return {
      user,
      ...tokens,
    };
  }

  async refresh(userId: string, email: string, role: string, rawRefreshToken: string) {
    const activeTokens = await this.refreshTokensRepository.find({
      where: { userId, isActive: true },
    });

    // Find the record matching the raw token
    let currentTokenRecord: RefreshToken | null = null;
    for (const record of activeTokens) {
      const match = await bcrypt.compare(rawRefreshToken, record.hashedToken);
      if (match) {
        currentTokenRecord = record;
        break;
      }
    }

    if (!currentTokenRecord) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (new Date() > currentTokenRecord.expiresAt) {
      // Invalidate expired session
      currentTokenRecord.isActive = false;
      await this.refreshTokensRepository.save(currentTokenRecord);
      throw new UnauthorizedException('Session expired. Please login again');
    }

    // Refresh Token Rotation (RTR): Invalidate old token and issue new pair
    return this.dataSource.transaction(async (manager) => {
      await manager.update(RefreshToken, { id: currentTokenRecord!.id }, { isActive: false });

      const tokens = await this.generateTokens(userId, email, role);
      
      // Save new refresh token record
      const hashedNewToken = await bcrypt.hash(tokens.refreshToken, 10);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const newRecord = manager.create(RefreshToken, {
        userId,
        hashedToken: hashedNewToken,
        expiresAt,
      });
      await manager.save(newRecord);

      return tokens;
    });
  }

  async logout(userId: string, rawRefreshToken: string): Promise<void> {
    const activeTokens = await this.refreshTokensRepository.find({
      where: { userId, isActive: true },
    });

    for (const record of activeTokens) {
      const match = await bcrypt.compare(rawRefreshToken, record.hashedToken);
      if (match) {
        record.isActive = false;
        await this.refreshTokensRepository.save(record);
        break;
      }
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day cookie

    const tokenRecord = this.refreshTokensRepository.create({
      userId,
      hashedToken,
      expiresAt,
    });
    await this.refreshTokensRepository.save(tokenRecord);
  }
}
