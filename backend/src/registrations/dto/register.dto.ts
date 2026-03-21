import { IsArray, IsEmail, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'teacherken@gmail.com' })
  @IsEmail()
  teacher: string;

  @ApiProperty({
    example: ['studentjon@gmail.com', 'studenthon@gmail.com'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  students: string[];
}
