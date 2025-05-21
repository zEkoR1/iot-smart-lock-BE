import {IsEmail, IsNotEmpty, IsString, MinLength} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  fingerprint: string;

  @IsString()
  @IsNotEmpty()
  face: string;
}
