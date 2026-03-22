import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { TeachersService } from '../teachers/teachers.service';
import { StudentsService } from '../students/students.service';
import { RegistrationsRepository } from './registrations.repository';
import { RegisterDto } from './dto/register.dto';
import { RetrieveNotificationsDto } from './dto/retrieve-notifications.dto';
import {
  ICommonStudentsResult,
  INotificationRecipientsResult,
} from './interfaces/registration.interface';

@Injectable()
export class RegistrationsService {
  private readonly mentionRegex = /@([\w.+-]+@[\w-]+\.[\w.]+)/g;

  constructor(
    @InjectPinoLogger(RegistrationsService.name)
    private readonly logger: PinoLogger,
    private readonly teachersService: TeachersService,
    private readonly studentsService: StudentsService,
    private readonly registrationsRepository: RegistrationsRepository,
  ) {}

  async register(dto: RegisterDto): Promise<void> {
    const teacherAsStudent = await this.studentsService.findByEmail(
      dto.teacher,
    );
    if (teacherAsStudent) {
      this.logger.warn(
        { teacher: dto.teacher },
        'Registration rejected: teacher email is already registered as a student',
      );
      throw new BadRequestException(
        `Email ${dto.teacher} is already registered as a student`,
      );
    }

    const conflictingStudents = await Promise.all(
      dto.students.map(async (email) => {
        const asTeacher = await this.teachersService.findByEmail(email);
        return asTeacher ? email : null;
      }),
    );
    const conflicts = conflictingStudents.filter(Boolean);
    if (conflicts.length > 0) {
      this.logger.warn(
        { conflicts },
        'Registration rejected: student emails are already registered as teachers',
      );
      throw new BadRequestException(
        `The following emails are already registered as teachers: ${conflicts.join(', ')}`,
      );
    }

    const teacher = await this.teachersService.upsertByEmail(dto.teacher);

    await Promise.all(
      dto.students.map(async (email) => {
        const student = await this.studentsService.upsertByEmail(email);
        await this.registrationsRepository.linkTeacherToStudent(
          teacher.id,
          student.id,
        );
      }),
    );

    this.logger.info(
      { teacher: dto.teacher, studentCount: dto.students.length },
      'Students registered to teacher',
    );
  }

  async getCommonStudents(
    teacherEmails: string[],
  ): Promise<ICommonStudentsResult> {
    const students =
      await this.registrationsRepository.findStudentsRegisteredToAllTeachers(
        teacherEmails,
      );
    return { students };
  }

  async suspendStudent(email: string): Promise<void> {
    await this.studentsService.suspend(email);
  }

  async retrieveForNotifications(
    dto: RetrieveNotificationsDto,
  ): Promise<INotificationRecipientsResult> {
    const teacher = await this.teachersService.findByEmail(dto.teacher);
    if (!teacher) {
      throw new NotFoundException(`Teacher ${dto.teacher} does not exist`);
    }

    const mentionedEmails = this.extractMentions(dto.notification);
    const registeredEmails =
      await this.registrationsRepository.findActiveStudentEmailsForTeacher(
        dto.teacher,
      );

    const allEmails = [...new Set([...registeredEmails, ...mentionedEmails])];

    const activeStudents =
      await this.studentsService.findActiveByEmails(allEmails);
    const recipients = activeStudents.map((s) => s.email);

    return { recipients };
  }

  private extractMentions(text: string): string[] {
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    const regex = new RegExp(this.mentionRegex.source, 'g');
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }
}
