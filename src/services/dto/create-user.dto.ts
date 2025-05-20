import { IsString, IsUUID } from 'class-validator';

export class CreateUserDto {
    @IsString()
    name!: string;
    
    @IsString()
    fingerprint!: string;
    
    @IsString()
    face!: string;
    
    @IsUUID()
    deviceId!: string;
    
    @IsString()
    role!: string;
}
