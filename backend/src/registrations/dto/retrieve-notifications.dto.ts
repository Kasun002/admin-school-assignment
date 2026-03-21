import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RetrieveNotificationsDto {
  @ApiProperty({ example: 'teacherken@gmail.com' })
  @IsEmail()
  teacher: string;

  @ApiProperty({
    example: 'Hello students! @studentagnes@gmail.com @studentmiche@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  notification: string;
}
