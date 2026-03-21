import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  ArrayNotEmpty,
  ArrayMaxSize,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'teacherken@gmail.com' })
  @IsString()
  @IsNotEmpty({ message: 'Teacher email must not be empty' })
  @MaxLength(255, { message: 'Teacher email must not exceed 255 characters' })
  @IsEmail({}, { message: 'Teacher must be a valid email address' })
  teacher: string;

  @ApiProperty({
    example: ['studentjon@gmail.com', 'studenthon@gmail.com'],
    type: [String],
  })
  @IsArray({ message: 'Students must be an array' })
  @ArrayNotEmpty({ message: 'Students list must not be empty' })
  @ArrayMaxSize(50, {
    message: 'Cannot register more than 50 students at once',
  })
  @IsString({ each: true, message: 'Each student entry must be a string' })
  @IsEmail(
    {},
    { each: true, message: 'Each student must be a valid email address' },
  )
  @MaxLength(255, {
    each: true,
    message: 'Each student email must not exceed 255 characters',
  })
  students: string[];
}
