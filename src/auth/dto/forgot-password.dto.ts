import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'jane@simulation.io' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
