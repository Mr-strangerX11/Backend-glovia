import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto } from './dto/users.dto';
import { AddAddressWithGeoDto } from './dto/add-address-geo.dto';
import { User, Address, Order } from '../../database/schemas';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Address') private addressModel: Model<Address>,
    @InjectModel('Order') private orderModel: Model<Order>,
  ) {}

  async updateUserPermissions(userId: string, permissions: Record<string, boolean>) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { permissions },
      { new: true }
    ).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('id email phone firstName lastName role skinType profileImage isEmailVerified isPhoneVerified createdAt')
      .lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.userModel
      .findByIdAndUpdate(userId, dto, { new: true })
      .select('id email phone firstName lastName skinType profileImage')
      .lean();
  }

  async getAddresses(userId: string) {
    return this.addressModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    const addressCount = await this.addressModel.countDocuments({ userId: new Types.ObjectId(userId) });
    const shouldSetDefault = dto.isDefault || addressCount === 0;

    if (shouldSetDefault) {
      await this.addressModel.updateMany(
        { userId: new Types.ObjectId(userId) },
        { isDefault: false }
      );
    }

    return this.addressModel.create({
      ...dto,
      isDefault: shouldSetDefault,
      userId: new Types.ObjectId(userId),
    });
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.addressModel.findOne({
      _id: new Types.ObjectId(addressId),
      userId: new Types.ObjectId(userId),
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const makeDefault = dto.isDefault === true;

    if (makeDefault) {
      await this.addressModel.updateMany(
        { userId: new Types.ObjectId(userId), _id: { $ne: new Types.ObjectId(addressId) } },
        { isDefault: false }
      );
    }

    const updated = await this.addressModel
      .findByIdAndUpdate(
        addressId,
        {
          ...dto,
          isDefault: makeDefault ? true : dto.isDefault,
        },
        { new: true }
      )
      .lean();

    const defaultExists = await this.addressModel.findOne({
      userId: new Types.ObjectId(userId),
      isDefault: true,
    });

    if (!defaultExists) {
      await this.addressModel.findByIdAndUpdate(updated._id, { isDefault: true });
      return { ...updated, isDefault: true };
    }

    return updated;
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.addressModel.findOne({
      _id: new Types.ObjectId(addressId),
      userId: new Types.ObjectId(userId),
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.addressModel.findByIdAndDelete(addressId);

    return { message: 'Address deleted successfully' };
  }

  async createAddressWithGeo(userId: string, dto: AddAddressWithGeoDto) {
    const addressCount = await this.addressModel.countDocuments({ userId: new Types.ObjectId(userId) });
    const isFirstAddress = addressCount === 0;

    // Auto-verify if coordinates provided
    const isVerified = !!(dto.latitude && dto.longitude);

    const address = await this.addressModel.create({
      userId: new Types.ObjectId(userId),
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
    });

    // Boost trust score if geo-verified
    if (isVerified) {
      await this.userModel.findByIdAndUpdate(userId, {
        $inc: { trustScore: 20 },
      });
    }

    return address;
  }

  async getOrderHistory(userId: string) {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'items',
        populate: {
          path: 'productId',
          select: 'id name slug',
        },
      })
      .populate('addressId')
      .sort({ createdAt: -1 })
      .lean();
  }
}
