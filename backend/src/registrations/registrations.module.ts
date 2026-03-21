import { Module } from '@nestjs/common';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { RegistrationsRepository } from './registrations.repository';
import { TeachersModule } from '../teachers/teachers.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [TeachersModule, StudentsModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService, RegistrationsRepository],
})
export class RegistrationsModule {}
