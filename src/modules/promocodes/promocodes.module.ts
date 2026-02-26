import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromoCode, PromoCodeSchema } from './promocodes.schema';
import { PromoCodesService } from './promocodes.service';
import { PromoCodesController } from './promocodes.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PromoCode', schema: PromoCodeSchema },
    ]),
  ],
  providers: [PromoCodesService],
  controllers: [PromoCodesController],
})
export class PromoCodesModule {}
