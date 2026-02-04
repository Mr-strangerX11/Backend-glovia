import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto } from './dto/users.dto';
import { AddAddressWithGeoDto } from './dto/add-address-geo.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        skinType: true,
        profileImage: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        skinType: true,
        profileImage: true,
      },
    });
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    const addressCount = await this.prisma.address.count({ where: { userId } });
    const shouldSetDefault = dto.isDefault || addressCount === 0;

    if (shouldSetDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        ...dto,
        isDefault: shouldSetDefault,
        userId,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const makeDefault = dto.isDefault === true;

    if (makeDefault) {
      await this.prisma.address.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: {
        ...dto,
        isDefault: makeDefault ? true : dto.isDefault,
      },
    });

    const defaultExists = await this.prisma.address.findFirst({
      where: { userId, isDefault: true },
    });

    if (!defaultExists) {
      await this.prisma.address.update({
        where: { id: updated.id },
        data: { isDefault: true },
      });
      return { ...updated, isDefault: true };
    }

    return updated;
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    return { message: 'Address deleted successfully' };
  }

  async createAddressWithGeo(userId: string, dto: AddAddressWithGeoDto) {
    const addressCount = await this.prisma.address.count({ where: { userId } });
    const isFirstAddress = addressCount === 0;

    // Auto-verify if coordinates provided
    const isVerified = !!(dto.latitude && dto.longitude);

    const address = await this.prisma.address.create({
      data: {
        userId,
        fullName: dto.fullName,
        phone: dto.phone,
        province: dto.province,
        district: dto.district,
        municipality: dto.municipality,
        wardNo: dto.wardNo,
        area: dto.area,
        landmark: dto.landmark,
        latitude: dto.latitude ? Number(dto.latitude) : null,
        longitude: dto.longitude ? Number(dto.longitude) : null,
        isVerified,
        isDefault: isFirstAddress,
      },
    });

    // Boost trust score if geo-verified
    if (isVerified) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { trustScore: { increment: 20 } },
      });
    }

    return address;
  }

  async getOrderHistory(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  take: 1,
                  orderBy: { displayOrder: 'asc' },
                },
              },
            },
          },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
