import { Injectable } from '@nestjs/common';
import { Teacher } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeachersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertByEmail(email: string): Promise<Teacher> {
    return this.prisma.teacher.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  }

  async findByEmail(email: string): Promise<Teacher | null> {
    return this.prisma.teacher.findUnique({ where: { email } });
  }
}
