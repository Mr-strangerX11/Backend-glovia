import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminUsersController } from './users.admin.controller';
import { UserSchema, AddressSchema, OrderSchema } from '../../database/schemas';
import { AuditLogModule } from '../auditlog/auditlog.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Address', schema: AddressSchema },
      { name: 'Order', schema: OrderSchema },
    ]),
    AuditLogModule,
  ],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
