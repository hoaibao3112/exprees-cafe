import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from '../content/entities/banner.entity';
import { Branch } from '../branches/entities/branch.entity';
import { ContentModule } from '../content/content.module';
import { BranchesModule } from '../branches/branches.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner, Branch]),
    ContentModule,
    BranchesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
