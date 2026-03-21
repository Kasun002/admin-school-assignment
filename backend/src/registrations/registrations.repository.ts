import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegistrationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async linkTeacherToStudent(
    teacherId: number,
    studentId: number,
  ): Promise<void> {
    await this.prisma.teacherStudent.upsert({
      where: { teacherId_studentId: { teacherId, studentId } },
      update: {},
      create: { teacherId, studentId },
    });
  }

  async findStudentsRegisteredToAllTeachers(
    teacherEmails: string[],
  ): Promise<string[]> {
    const count = teacherEmails.length;
    const students = await this.prisma.student.findMany({
      where: {
        isSuspended: false,
        teachers: {
          some: {
            teacher: { email: { in: teacherEmails } },
          },
        },
      },
      select: {
        email: true,
        teachers: {
          where: { teacher: { email: { in: teacherEmails } } },
          select: { teacherId: true },
        },
      },
    });

    // Keep only students linked to ALL of the given teachers
    return students
      .filter((s) => s.teachers.length === count)
      .map((s) => s.email);
  }

  async findActiveStudentEmailsForTeacher(
    teacherEmail: string,
  ): Promise<string[]> {
    const students = await this.prisma.student.findMany({
      where: {
        isSuspended: false,
        teachers: {
          some: {
            teacher: { email: teacherEmail },
          },
        },
      },
      select: { email: true },
    });

    return students.map((s) => s.email);
  }
}
