import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private checkPermission(currentUser: User, targetUserId: string) {
    if (currentUser.id !== targetUserId && currentUser.role?.name !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() currentUser: User,
  ) {
    this.checkPermission(currentUser, id);
    return this.usersService.updateProfile(id, dto);
  }

  @Get(':id/addresses')
  @ApiOperation({ summary: 'Get list of user addresses' })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully' })
  async getAddresses(@Param('id') id: string, @CurrentUser() currentUser: User) {
    this.checkPermission(currentUser, id);
    return this.usersService.getAddresses(id);
  }

  @Post(':id/addresses')
  @ApiOperation({ summary: 'Create new user address' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  async createAddress(
    @Param('id') id: string,
    @Body() dto: CreateAddressDto,
    @CurrentUser() currentUser: User,
  ) {
    this.checkPermission(currentUser, id);
    return this.usersService.createAddress(id, dto);
  }

  @Put(':id/addresses/:addressId')
  @ApiOperation({ summary: 'Update user address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  async updateAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
    @CurrentUser() currentUser: User,
  ) {
    this.checkPermission(currentUser, id);
    return this.usersService.updateAddress(id, addressId, dto);
  }

  @Delete(':id/addresses/:addressId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user address' })
  @ApiResponse({ status: 204, description: 'Address deleted successfully' })
  async deleteAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @CurrentUser() currentUser: User,
  ) {
    this.checkPermission(currentUser, id);
    await this.usersService.deleteAddress(id, addressId);
  }

  @Get(':id/loyalty')
  @ApiOperation({ summary: 'Get user loyalty points and history ledger' })
  @ApiResponse({ status: 200, description: 'Loyalty information retrieved successfully' })
  async getLoyaltyInfo(@Param('id') id: string, @CurrentUser() currentUser: User) {
    this.checkPermission(currentUser, id);
    return this.usersService.getLoyaltyInfo(id);
  }
}
