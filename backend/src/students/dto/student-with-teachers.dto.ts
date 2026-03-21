import { ApiProperty } from '@nestjs/swagger';

export class StudentWithTeachersDto {
  @ApiProperty({ example: 'studentjon@gmail.com' })
  email: string;

  @ApiProperty({ example: false })
  isSuspended: boolean;

  @ApiProperty({ example: ['teacherken@gmail.com'], type: [String] })
  teachers: string[];
}

export class PaginatedStudentsResponseDto {
  @ApiProperty({ type: [StudentWithTeachersDto] })
  data: StudentWithTeachersDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
