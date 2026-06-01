import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new branch (Admin)' })
  create(
    @Body()
    createDto: {
      name: string;
      address: string;
      lat: number;
      lng: number;
      phone?: string;
      openingHours?: any;
      status?: string;
      isFlagship?: boolean;
    },
  ) {
    return this.branchesService.create(createDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all branches' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('status') status?: string) {
    return this.branchesService.findAll(status);
  }

  @Public()
  @Get('nearest')
  @ApiOperation({ summary: 'Get branches nearest to coordinates' })
  @ApiQuery({ name: 'lat', type: Number })
  @ApiQuery({ name: 'lng', type: Number })
  @ApiQuery({ name: 'maxDistanceKm', type: Number, required: false })
  findNearest(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('maxDistanceKm') maxDistanceKm?: number,
  ) {
    return this.branchesService.findNearest(Number(lat), Number(lng), maxDistanceKm ? Number(maxDistanceKm) : undefined);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get branch details by ID' })
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update branch details (Admin)' })
  update(
    @Param('id') id: string,
    @Body()
    updateDto: Partial<{
      name: string;
      address: string;
      lat: number;
      lng: number;
      phone: string;
      openingHours: any;
      status: string;
      isFlagship: boolean;
    }>,
  ) {
    return this.branchesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete branch (Admin)' })
  remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}
