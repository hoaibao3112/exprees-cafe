import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import * as Joi from 'joi';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';

import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

import { User } from './modules/users/entities/user.entity';
import { Role } from './modules/users/entities/role.entity';
import { Permission } from './modules/users/entities/permission.entity';
import { Address } from './modules/users/entities/address.entity';
import { LoyaltyTransaction } from './modules/users/entities/loyalty-transaction.entity';
import { RefreshToken } from './modules/auth/entities/refresh-token.entity';
import { OtpCode } from './modules/auth/entities/otp-code.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().allow('').optional(),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database'),
        entities: [
          User,
          Role,
          Permission,
          Address,
          LoyaltyTransaction,
          RefreshToken,
          OtpCode,
        ],
        synchronize: true, // Safe for local sandboxed development
      }),
    }),
    RedisModule,
    AuthModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // JWT auth globally active, bypass with @Public()
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Roles checked globally, decorated with @Roles()
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard, // Redis rate limiting checked globally
    },
  ],
})
export class AppModule {}
