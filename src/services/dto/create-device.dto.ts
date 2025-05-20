import { IsString, IsOptional } from 'class-validator';

export class CreateDeviceDto {
    @IsString()
    name!: string;
    
    @IsOptional()
    @IsString()
    apiKey?: string;
}