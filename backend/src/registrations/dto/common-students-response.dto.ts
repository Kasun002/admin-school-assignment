import { ApiProperty } from '@nestjs/swagger';

export class CommonStudentsResponseDto {
  @ApiProperty({
    example: ['commonstudent1@gmail.com', 'commonstudent2@gmail.com'],
    type: [String],
  })
  students: string[];
}
