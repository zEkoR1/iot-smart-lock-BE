import { IsString, IsUUID } from 'class-validator';

export class CreateUserDto {
    @IsString()
    name!: string;

    // @IsString()
    fingerprint!: any;

    // @IsString()
    face!: any;

    @IsUUID()
    deviceId!: string;

    @IsString()
    role!: string;
}
