import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Dashboard statistics' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Public()
  @Post('contacts')
  @ApiOperation({ summary: 'Submit a new customer contact inquiry' })
  submitContact(@Body() dto: Record<string, unknown>) {
    return this.adminService.submitContact(dto);
  }

  @Get('contacts')
  @ApiOperation({ summary: 'List customer contacts' })
  getContacts() {
    return this.adminService.getContacts();
  }

  @Patch('contacts/:id/read')
  @ApiOperation({ summary: 'Mark contact as read' })
  markContactRead(@Param('id') id: string) {
    return this.adminService.markContactRead(id);
  }

  @Get('banners')
  @ApiOperation({ summary: 'List all banners' })
  getBanners() {
    return this.adminService.getBanners();
  }

  @Patch('banners/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reorder banner slides' })
  reorderBanners(@Body() body: { items: { id: string; order: number }[] }) {
    return this.adminService.reorderBanners(body.items);
  }

  @Patch('banners/:id')
  @ApiOperation({ summary: 'Update banner slide' })
  updateBanner(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.adminService.updateBanner(id, dto);
  }

  @Post('banners')
  @ApiOperation({ summary: 'Create banner slide' })
  createBanner(@Body() dto: Record<string, unknown>) {
    return this.adminService.createBanner(dto);
  }

  @Delete('banners/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete banner slide' })
  deleteBanner(@Param('id') id: string) {
    return this.adminService.deleteBanner(id);
  }

  @Get('articles')
  @ApiOperation({ summary: 'List all articles' })
  getArticles(@Query() query: Record<string, string>) {
    return this.adminService.getArticles(query);
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get article by ID' })
  getArticleById(@Param('id') id: string) {
    return this.adminService.getArticleById(id);
  }

  @Post('articles')
  @ApiOperation({ summary: 'Create article' })
  createArticle(@Body() dto: Record<string, unknown>) {
    return this.adminService.createArticle(dto);
  }

  @Put('articles/:id')
  @ApiOperation({ summary: 'Update article' })
  updateArticle(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.adminService.updateArticle(id, dto);
  }

  @Delete('articles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete article' })
  deleteArticle(@Param('id') id: string) {
    return this.adminService.deleteArticle(id);
  }

  @Patch('articles/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle article publish status' })
  toggleArticleStatus(@Param('id') id: string) {
    return this.adminService.toggleArticleStatus(id);
  }

  @Get('branches')
  @ApiOperation({ summary: 'List all branches' })
  getBranches() {
    return this.adminService.getBranches();
  }

  @Get('branches/:id')
  @ApiOperation({ summary: 'Get branch by ID' })
  getBranchById(@Param('id') id: string) {
    return this.adminService.getBranchById(id);
  }

  @Post('branches')
  @ApiOperation({ summary: 'Create branch' })
  createBranch(@Body() dto: Record<string, unknown>) {
    return this.adminService.createBranch(dto);
  }

  @Put('branches/:id')
  @ApiOperation({ summary: 'Update branch' })
  updateBranch(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.adminService.updateBranch(id, dto);
  }

  @Delete('branches/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete branch' })
  deleteBranch(@Param('id') id: string) {
    return this.adminService.deleteBranch(id);
  }

  @Patch('branches/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle branch active status' })
  toggleBranchStatus(@Param('id') id: string) {
    return this.adminService.toggleBranchStatus(id);
  }

  @Public()
  @Get('settings/public')
  @ApiOperation({ summary: 'Get public site settings' })
  getPublicSettings() {
    return this.adminService.getSettings();
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get site settings' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Put('settings')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update site settings' })
  updateSettings(@Body() dto: Record<string, unknown>) {
    return this.adminService.updateSettings(dto);
  }
}
