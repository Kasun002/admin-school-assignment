import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';

@Module({
  imports: [PrismaModule, TeachersModule, StudentsModule, RegistrationsModule],
})
export class AppModule {}
