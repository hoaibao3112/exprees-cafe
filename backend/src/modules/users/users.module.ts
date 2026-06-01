import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Address } from './entities/address.entity';
import { LoyaltyTransaction } from './entities/loyalty-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      Address,
      LoyaltyTransaction,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
