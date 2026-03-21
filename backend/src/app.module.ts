import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [PrismaModule, TeachersModule, StudentsModule, RegistrationsModule],
  controllers: [HealthController],
})
export class AppModule {}
