import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RegistrationsService } from '../../registrations/registrations.service';
import { TeachersService } from '../../teachers/teachers.service';
import { StudentsService } from '../../students/students.service';
import { RegistrationsRepository } from '../../registrations/registrations.repository';

const makeTeacher = (email = 'teacherken@gmail.com') => ({
  id: 1,
  email,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeStudent = (email: string, isSuspended = false) => ({
  id: Math.floor(Math.random() * 1000),
  email,
  isSuspended,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('RegistrationsService', () => {
  let service: RegistrationsService;
  let teachersService: jest.Mocked<TeachersService>;
  let studentsService: jest.Mocked<StudentsService>;
  let registrationsRepo: jest.Mocked<RegistrationsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationsService,
        {
          provide: TeachersService,
          useValue: {
            findByEmail: jest.fn(),
            upsertByEmail: jest.fn(),
          },
        },
        {
          provide: StudentsService,
          useValue: {
            findByEmail: jest.fn(),
            upsertByEmail: jest.fn(),
            suspend: jest.fn(),
            findActiveByEmails: jest.fn(),
          },
        },
        {
          provide: RegistrationsRepository,
          useValue: {
            linkTeacherToStudent: jest.fn(),
            findStudentsRegisteredToAllTeachers: jest.fn(),
            findActiveStudentEmailsForTeacher: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RegistrationsService);
    teachersService = module.get(TeachersService);
    studentsService = module.get(StudentsService);
    registrationsRepo = module.get(RegistrationsRepository);
  });

  describe('register', () => {
    const dto = {
      teacher: 'teacherken@gmail.com',
      students: ['studentjon@gmail.com', 'studenthon@gmail.com'],
    };

    beforeEach(() => {
      studentsService.findByEmail.mockResolvedValue(null);
      teachersService.findByEmail.mockResolvedValue(null);
      teachersService.upsertByEmail.mockResolvedValue(makeTeacher());
      studentsService.upsertByEmail.mockImplementation(async (email) =>
        makeStudent(email),
      );
      registrationsRepo.linkTeacherToStudent.mockResolvedValue(undefined);
    });

    it('upserts teacher and all students then links each pair', async () => {
      await service.register(dto);

      expect(teachersService.upsertByEmail).toHaveBeenCalledWith(dto.teacher);
      expect(studentsService.upsertByEmail).toHaveBeenCalledTimes(dto.students.length);
      expect(registrationsRepo.linkTeacherToStudent).toHaveBeenCalledTimes(dto.students.length);
    });

    it('throws BadRequestException when teacher email is already a student', async () => {
      studentsService.findByEmail.mockResolvedValue(makeStudent(dto.teacher));

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });

    it('includes the teacher email in the conflict error message', async () => {
      studentsService.findByEmail.mockResolvedValue(makeStudent(dto.teacher));

      await expect(service.register(dto)).rejects.toThrow(
        `Email ${dto.teacher} is already registered as a student`,
      );
    });

    it('throws BadRequestException when a student email is already a teacher', async () => {
      teachersService.findByEmail.mockResolvedValue(makeTeacher(dto.students[0]));

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
      await expect(service.register(dto)).rejects.toThrow('already registered as teachers');
    });

    it('includes all conflicting emails in the error message', async () => {
      teachersService.findByEmail.mockImplementation(async (email) =>
        dto.students.includes(email) ? makeTeacher(email) : null,
      );

      const err = await service.register(dto).catch((e: Error) => e);
      expect(err.message).toContain(dto.students[0]);
      expect(err.message).toContain(dto.students[1]);
    });

    it('does not proceed to upsert when teacher conflict is detected', async () => {
      studentsService.findByEmail.mockResolvedValueOnce(makeStudent(dto.teacher));

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
      expect(teachersService.upsertByEmail).not.toHaveBeenCalled();
    });
  });

  describe('getCommonStudents', () => {
    it('returns students from repository', async () => {
      const emails = ['common@gmail.com'];
      registrationsRepo.findStudentsRegisteredToAllTeachers.mockResolvedValue(emails);

      const result = await service.getCommonStudents(['teacher1@gmail.com', 'teacher2@gmail.com']);

      expect(result).toEqual({ students: emails });
      expect(registrationsRepo.findStudentsRegisteredToAllTeachers).toHaveBeenCalledWith([
        'teacher1@gmail.com',
        'teacher2@gmail.com',
      ]);
    });

    it('returns empty list when no common students', async () => {
      registrationsRepo.findStudentsRegisteredToAllTeachers.mockResolvedValue([]);

      const result = await service.getCommonStudents(['teacher1@gmail.com']);

      expect(result).toEqual({ students: [] });
    });
  });

  describe('suspendStudent', () => {
    it('delegates to studentsService.suspend', async () => {
      studentsService.suspend.mockResolvedValue(undefined);

      await service.suspendStudent('student@gmail.com');

      expect(studentsService.suspend).toHaveBeenCalledWith('student@gmail.com');
    });

    it('propagates NotFoundException when student does not exist', async () => {
      studentsService.suspend.mockRejectedValue(
        new NotFoundException('Student not found'),
      );

      await expect(service.suspendStudent('nobody@gmail.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('retrieveForNotifications', () => {
    const teacher = 'teacherken@gmail.com';

    it('throws NotFoundException when teacher does not exist', async () => {
      teachersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.retrieveForNotifications({ teacher, notification: 'Hello' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns registered non-suspended students when notification has no mentions', async () => {
      teachersService.findByEmail.mockResolvedValue(makeTeacher());
      registrationsRepo.findActiveStudentEmailsForTeacher.mockResolvedValue([
        'studentbob@gmail.com',
      ]);
      studentsService.findActiveByEmails.mockResolvedValue([
        makeStudent('studentbob@gmail.com'),
      ]);

      const result = await service.retrieveForNotifications({
        teacher,
        notification: 'Hey everybody',
      });

      expect(result).toEqual({ recipients: ['studentbob@gmail.com'] });
    });

    it('includes @mentioned students not registered to the teacher', async () => {
      teachersService.findByEmail.mockResolvedValue(makeTeacher());
      registrationsRepo.findActiveStudentEmailsForTeacher.mockResolvedValue([
        'studentbob@gmail.com',
      ]);
      studentsService.findActiveByEmails.mockResolvedValue([
        makeStudent('studentbob@gmail.com'),
        makeStudent('studentagnes@gmail.com'),
        makeStudent('studentmiche@gmail.com'),
      ]);

      const result = await service.retrieveForNotifications({
        teacher,
        notification: 'Hello! @studentagnes@gmail.com @studentmiche@gmail.com',
      });

      expect(studentsService.findActiveByEmails).toHaveBeenCalledWith(
        expect.arrayContaining([
          'studentbob@gmail.com',
          'studentagnes@gmail.com',
          'studentmiche@gmail.com',
        ]),
      );
      expect(result.recipients).toHaveLength(3);
    });

    it('excludes suspended students even if @mentioned', async () => {
      teachersService.findByEmail.mockResolvedValue(makeTeacher());
      registrationsRepo.findActiveStudentEmailsForTeacher.mockResolvedValue([]);
      studentsService.findActiveByEmails.mockResolvedValue([]);

      const result = await service.retrieveForNotifications({
        teacher,
        notification: 'Hi @suspended@gmail.com',
      });

      expect(result).toEqual({ recipients: [] });
    });

    it('deduplicates a student who is both registered and @mentioned', async () => {
      teachersService.findByEmail.mockResolvedValue(makeTeacher());
      registrationsRepo.findActiveStudentEmailsForTeacher.mockResolvedValue([
        'studentbob@gmail.com',
      ]);
      studentsService.findActiveByEmails.mockResolvedValue([
        makeStudent('studentbob@gmail.com'),
      ]);

      await service.retrieveForNotifications({
        teacher,
        notification: 'Hey @studentbob@gmail.com',
      });

      const callArg = studentsService.findActiveByEmails.mock.calls[0][0] as string[];
      const occurrences = callArg.filter((e) => e === 'studentbob@gmail.com').length;
      expect(occurrences).toBe(1);
    });

    it('returns empty recipients when teacher has no students and no mentions', async () => {
      teachersService.findByEmail.mockResolvedValue(makeTeacher());
      registrationsRepo.findActiveStudentEmailsForTeacher.mockResolvedValue([]);
      studentsService.findActiveByEmails.mockResolvedValue([]);

      const result = await service.retrieveForNotifications({
        teacher,
        notification: 'Hey everybody',
      });

      expect(result).toEqual({ recipients: [] });
    });
  });
});
