import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsEnum, IsNotEmpty } from 'class-validator';
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
  @ApiProperty({ enum: UserRole, example: 'VENDOR', description: 'New role for the user' })
  @IsEnum(UserRole, { message: 'role must be a valid UserRole (CUSTOMER, ADMIN, SUPER_ADMIN, VENDOR)' })
  @IsNotEmpty({ message: 'role is required' })
  role: UserRole;
}
