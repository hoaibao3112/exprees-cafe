import { Controller, Get, Post, Body, Patch, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FranchiseService } from './franchise.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Franchise')
@Controller('franchise')
export class FranchiseController {
  constructor(private readonly franchiseService: FranchiseService) {}

  @Public()
  @Get('packages')
  @ApiOperation({ summary: 'List all active investment packages' })
  findAllPackages() {
    return this.franchiseService.findAllPackages(true);
  }

  @Post('admin/packages')
  @ApiOperation({ summary: 'Create new investment package (Admin)' })
  createPackage(
    @Body()
    dto: {
      name: string;
      modelType: string;
      investmentFrom: number;
      description?: string;
      isActive?: boolean;
    },
  ) {
    return this.franchiseService.createPackage(dto);
  }

  @Post('apply')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Apply for franchise program (Authenticated)' })
  apply(
    @CurrentUser('id') userId: string,
    @Body()
    dto: {
      packageId: string;
      applicantName: string;
      phone: string;
      province: string;
      notes?: string;
    },
  ) {
    return this.franchiseService.apply(userId, dto);
  }

  @Get('admin/applications')
  @ApiOperation({ summary: 'List all franchise requests (Admin)' })
  findAllApplications() {
    return this.franchiseService.findAllApplications();
  }

  @Patch('admin/applications/:id')
  @ApiOperation({ summary: 'Update franchise request status (Admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body()
    dto: {
      status: string; // APPROVED, REJECTED, REVIEWING
      notes?: string;
    },
  ) {
    return this.franchiseService.updateApplicationStatus(id, dto.status, dto.notes);
  }
}
