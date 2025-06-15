import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLogDto {
    @IsBoolean()
    @IsNotEmpty()
    status!: boolean;

    @IsString()
    @IsOptional()
    message?: string;

    @IsString()
    @IsOptional()
    ipAddress?: string;

    @IsUUID()
    @IsOptional()
    userId?: string | undefined;

    @IsUUID()
    @IsOptional()
    deviceId?: string | undefined;
} 