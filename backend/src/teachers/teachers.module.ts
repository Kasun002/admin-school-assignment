import { Module } from '@nestjs/common';
import { TeachersRepository } from './teachers.repository';
import { TeachersService } from './teachers.service';

@Module({
  providers: [TeachersRepository, TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
