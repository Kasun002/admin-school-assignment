import { Injectable } from '@nestjs/common';
import { Student } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertByEmail(email: string): Promise<Student> {
    return this.prisma.student.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  }

  async findByEmail(email: string): Promise<Student | null> {
    return this.prisma.student.findUnique({ where: { email } });
  }

  async suspend(email: string): Promise<Student> {
    return this.prisma.student.update({
      where: { email },
      data: { isSuspended: true },
    });
  }

  async findActiveByEmails(emails: string[]): Promise<Student[]> {
    return this.prisma.student.findMany({
      where: {
        email: { in: emails },
        isSuspended: false,
      },
    });
  }
}
