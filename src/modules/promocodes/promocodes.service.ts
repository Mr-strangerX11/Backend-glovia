import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PromoCode } from './promocodes.schema';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectModel('PromoCode') private promoCodeModel: Model<PromoCode>
  ) {}

  async create(dto: any) {
    return this.promoCodeModel.create(dto);
  }

  async findAll() {
    return this.promoCodeModel.find().lean();
  }

  async findByCode(code: string) {
    const promo = await this.promoCodeModel.findOne({ code, isActive: true }).lean();
    if (!promo) throw new NotFoundException('Promo code not found');
    return promo;
  }

  async update(id: string, dto: any) {
    return this.promoCodeModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string) {
    return this.promoCodeModel.findByIdAndDelete(id);
  }
}
