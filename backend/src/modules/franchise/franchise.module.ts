import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FranchisePackage } from './entities/franchise-package.entity';
import { FranchiseApplication } from './entities/franchise-application.entity';
import { FranchiseService } from './franchise.service';
import { FranchiseController } from './franchise.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FranchisePackage, FranchiseApplication])],
  controllers: [FranchiseController],
  providers: [FranchiseService],
  exports: [TypeOrmModule, FranchiseService],
})
export class FranchiseModule {}
