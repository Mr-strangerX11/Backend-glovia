import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { OtpService, EmailOtpService } from './otp.service';
import { DatabaseModule } from '../../database/prisma.module';

@Module({
  imports: [DatabaseModule],
  controllers: [VerificationController],
  providers: [VerificationService, OtpService, EmailOtpService],
  exports: [VerificationService, OtpService, EmailOtpService],
})
export class VerificationModule {}
