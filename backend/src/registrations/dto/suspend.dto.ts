import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuspendDto {
  @ApiProperty({ example: 'studentmary@gmail.com' })
  @IsString()
  @IsNotEmpty({ message: 'Student email must not be empty' })
  @MaxLength(255, { message: 'Student email must not exceed 255 characters' })
  @IsEmail({}, { message: 'Student must be a valid email address' })
  student: string;
}
