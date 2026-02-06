import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../../../database/schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ example: 'newuser@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password@123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'First' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Last' })
  @IsString()
  lastName: string;

  @ApiProperty({ required: false, example: '+97798xxxxxxx' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.CUSTOMER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.CUSTOMER;
}

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole, example: 'VENDOR' })
  @IsEnum(UserRole)
  role: UserRole;
}
