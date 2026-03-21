import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { GetStudentsQueryDto } from './dto/get-students-query.dto';
import { PaginatedStudentsResponseDto } from './dto/student-with-teachers.dto';

@ApiTags('students')
@Controller('api/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all students with their status and registered teachers',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of students',
    type: PaginatedStudentsResponseDto,
  })
  async getStudents(
    @Query() query: GetStudentsQueryDto,
  ): Promise<PaginatedStudentsResponseDto> {
    return this.studentsService.findWithTeachersPaginated(
      query.page,
      query.limit,
    );
  }
}
