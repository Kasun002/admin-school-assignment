import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RetrieveNotificationsDto {
  @ApiProperty({ example: 'teacherken@gmail.com' })
  @IsString()
  @IsNotEmpty({ message: 'Teacher email must not be empty' })
  @MaxLength(255, { message: 'Teacher email must not exceed 255 characters' })
  @IsEmail({}, { message: 'Teacher must be a valid email address' })
  teacher: string;

  @ApiProperty({
    example: 'Hello students! @studentagnes@gmail.com @studentmiche@gmail.com',
  })
  @IsString()
  @IsNotEmpty({ message: 'Notification message must not be empty' })
  @MaxLength(1000, {
    message: 'Notification message must not exceed 1000 characters',
  })
  notification: string;
}
