import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuspendDto {
  @ApiProperty({ example: 'studentmary@gmail.com' })
  @IsEmail()
  student: string;
}
