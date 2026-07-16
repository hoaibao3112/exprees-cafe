import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service (Admin)' })
  create(
    @Body()
    createDto: {
      name: string;
      url?: string;
      description?: string;
      images?: string[];
      status?: string;
    },
  ) {
    return this.servicesService.create(createDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all services' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('status') status?: string) {
    return this.servicesService.findAll(status);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get service details by ID' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service details (Admin)' })
  update(
    @Param('id') id: string,
    @Body()
    updateDto: Partial<{
      name: string;
      url: string;
      description: string;
      images: string[];
      status: string;
    }>,
  ) {
    return this.servicesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service (Admin)' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}