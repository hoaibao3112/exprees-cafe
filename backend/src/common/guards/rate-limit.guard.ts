import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private redisService: RedisService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.headers['x-forwarded-for'] || '127.0.0.1';
    
    // Determine user ID if authenticated
    const userId = request.user?.id;
    const isAuth = !!userId;

    const limit = isAuth ? 500 : 100;
    const windowSeconds = 60;

    const key = `rate_limit:${request.path}:${isAuth ? userId : ip}`;
    const withinLimit = await this.redisService.checkRateLimit(key, limit, windowSeconds);

    if (!withinLimit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later.',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
