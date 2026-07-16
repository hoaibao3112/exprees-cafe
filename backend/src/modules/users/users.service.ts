import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Address } from './entities/address.entity';
import { LoyaltyTransaction } from './entities/loyalty-transaction.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(Address)
    private addressesRepository: Repository<Address>,
    @InjectRepository(LoyaltyTransaction)
    private loyaltyTransactionsRepository: Repository<LoyaltyTransaction>,
    private dataSource: DataSource,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);
    if (dto.name) user.name = dto.name;
    if (dto.phoneNumber) user.phoneNumber = dto.phoneNumber;
    return this.usersRepository.save(user);
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return this.addressesRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', id: 'ASC' },
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto): Promise<Address> {
    return this.dataSource.transaction(async (manager) => {
      const existingAddresses = await manager.find(Address, { where: { userId } });
      
      // If it is the first address, it MUST be the default address
      const shouldBeDefault = existingAddresses.length === 0 ? true : !!dto.isDefault;

      if (shouldBeDefault) {
        // Toggle other default addresses to false
        await manager.update(Address, { userId }, { isDefault: false });
      }

      const address = manager.create(Address, {
        ...dto,
        userId,
        isDefault: shouldBeDefault,
      });

      return manager.save(address);
    });
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto): Promise<Address> {
    return this.dataSource.transaction(async (manager) => {
      const address = await manager.findOne(Address, { where: { id: addressId, userId } });
      if (!address) {
        throw new NotFoundException('Address not found');
      }

      if (dto.isDefault === true) {
        await manager.update(Address, { userId }, { isDefault: false });
      }

      Object.assign(address, dto);
      return manager.save(address);
    });
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const address = await manager.findOne(Address, { where: { id: addressId, userId } });
      if (!address) {
        throw new NotFoundException('Address not found');
      }

      const wasDefault = address.isDefault;
      await manager.remove(address);

      // If we deleted the default address and there are remaining addresses, assign a new default
      if (wasDefault) {
        const remaining = await manager.find(Address, {
          where: { userId },
          order: { id: 'ASC' },
        });
        if (remaining.length > 0) {
          remaining[0].isDefault = true;
          await manager.save(remaining[0]);
        }
      }
    });
  }

  async getLoyaltyInfo(userId: string) {
    const user = await this.findById(userId);
    const history = await this.loyaltyTransactionsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return {
      loyaltyPoints: user.loyaltyPoints,
      history,
    };
  }

  // Seeding helpers
  async getOrCreateRole(name: string, permissions: string[] = []): Promise<Role> {
    let role = await this.rolesRepository.findOne({ where: { name } });
    if (!role) {
      const permEntities = await Promise.all(
        permissions.map(async (pName) => {
          let perm = await this.permissionsRepository.findOne({ where: { name: pName } });
          if (!perm) {
            perm = this.permissionsRepository.create({ name: pName });
            await this.permissionsRepository.save(perm);
          }
          return perm;
        }),
      );

      role = this.rolesRepository.create({
        name,
        permissions: permEntities,
      });
      await this.rolesRepository.save(role);
    }
    return role;
  }
}
