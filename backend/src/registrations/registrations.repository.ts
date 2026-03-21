import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    const emailList = Prisma.join(teacherEmails);
    const count = teacherEmails.length;
    const results = await this.prisma.$queryRaw<{ email: string }[]>`
      SELECT s.email
      FROM students s
      INNER JOIN teacher_students ts ON ts.studentId = s.id
      INNER JOIN teachers t ON t.id = ts.teacherId
      WHERE t.email IN (${emailList})
        AND s.isSuspended = false
      GROUP BY s.id, s.email
      HAVING COUNT(DISTINCT t.id) = ${count}
    `;
    return results.map((r) => r.email);
  }

  async findActiveStudentEmailsForTeacher(
    teacherEmail: string,
  ): Promise<string[]> {
    const results = await this.prisma.$queryRaw<{ email: string }[]>`
      SELECT s.email
      FROM students s
      INNER JOIN teacher_students ts ON ts.studentId = s.id
      INNER JOIN teachers t ON t.id = ts.teacherId
      WHERE t.email = ${teacherEmail}
        AND s.isSuspended = false
    `;
    return results.map((r) => r.email);
  }
}
