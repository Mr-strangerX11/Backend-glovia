import { SkinType } from '../../../database/schemas/user.schema';
export declare class UpdateProfileDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    skinType?: SkinType;
    profileImage?: string;
}
export declare class SendEmailChangeOtpDto {
    email: string;
}
export declare class VerifyEmailChangeOtpDto {
    email: string;
    otp: string;
}
export declare class CreateAddressDto {
    fullName: string;
    phone: string;
    province: string;
    district: string;
    municipality: string;
    wardNo: number;
    area: string;
    landmark?: string;
    isDefault?: boolean;
}
export declare class UpdateAddressDto {
    fullName?: string;
    phone?: string;
    province?: string;
    district?: string;
    municipality?: string;
    wardNo?: number;
    area?: string;
    landmark?: string;
    isDefault?: boolean;
}
