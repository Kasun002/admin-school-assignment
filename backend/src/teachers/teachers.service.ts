import { Injectable } from '@nestjs/common';
import { Teacher } from '@prisma/client';
import { TeachersRepository } from './teachers.repository';

@Injectable()
export class TeachersService {
  constructor(private readonly teachersRepository: TeachersRepository) {}

  async upsertByEmail(email: string): Promise<Teacher> {
    return this.teachersRepository.upsertByEmail(email);
  }

  async findByEmail(email: string): Promise<Teacher | null> {
    return this.teachersRepository.findByEmail(email);
  }
}
