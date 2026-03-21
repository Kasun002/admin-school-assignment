import { Module } from '@nestjs/common';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

@Module({
  providers: [StudentsRepository, StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
