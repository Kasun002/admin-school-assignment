import { IsArray, IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CommonStudentsQueryDto {
  @ApiProperty({
    name: 'teacher',
    isArray: true,
    example: 'teacherken@gmail.com',
    description: 'One or more teacher email addresses',
  })
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value) ? value : [value],
  )
  @IsArray({ message: 'teacher must be an array of email addresses' })
  @IsNotEmpty({ each: true, message: 'Teacher email must not be empty' })
  @IsEmail(
    {},
    { each: true, message: 'Each teacher must be a valid email address' },
  )
  @MaxLength(255, {
    each: true,
    message: 'Each teacher email must not exceed 255 characters',
  })
  teacher: string[];
}
