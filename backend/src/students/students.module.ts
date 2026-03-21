import { Module } from '@nestjs/common';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';

@Module({
  controllers: [StudentsController],
  providers: [StudentsRepository, StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
