import { Injectable, NotFoundException } from '@nestjs/common';
import { Student } from '@prisma/client';
import { StudentsRepository } from './students.repository';
import { PaginatedStudentsResponseDto } from './dto/student-with-teachers.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  async upsertByEmail(email: string): Promise<Student> {
    return this.studentsRepository.upsertByEmail(email);
  }

  async findByEmail(email: string): Promise<Student | null> {
    return this.studentsRepository.findByEmail(email);
  }

  async suspend(email: string): Promise<void> {
    const student = await this.studentsRepository.findByEmail(email);
    if (!student) {
      throw new NotFoundException(`Student ${email} does not exist`);
    }
    await this.studentsRepository.suspend(email);
  }

  async findActiveByEmails(emails: string[]): Promise<Student[]> {
    return this.studentsRepository.findActiveByEmails(emails);
  }

  async findWithTeachersPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedStudentsResponseDto> {
    const skip = (page - 1) * limit;
    const { students, total } =
      await this.studentsRepository.findWithTeachersPaginated(skip, limit);
    return {
      data: students.map((s) => ({
        email: s.email,
        isSuspended: s.isSuspended,
        teachers: s.teachers.map((t) => t.teacher.email),
      })),
      total,
      page,
      limit,
    };
  }
}
