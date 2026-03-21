import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsRepository } from '../../registrations/registrations.repository';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  teacherStudent: {
    upsert: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

describe('RegistrationsRepository', () => {
  let repository: RegistrationsRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationsRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get(RegistrationsRepository);
  });

  describe('linkTeacherToStudent', () => {
    it('calls prisma.teacherStudent.upsert with correct composite key', async () => {
      mockPrisma.teacherStudent.upsert.mockResolvedValue({});

      await repository.linkTeacherToStudent(1, 2);

      expect(mockPrisma.teacherStudent.upsert).toHaveBeenCalledWith({
        where: { teacherId_studentId: { teacherId: 1, studentId: 2 } },
        update: {},
        create: { teacherId: 1, studentId: 2 },
      });
    });
  });

  describe('findStudentsRegisteredToAllTeachers', () => {
    it('returns emails from raw query result', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { email: 'common1@gmail.com' },
        { email: 'common2@gmail.com' },
      ]);

      const result = await repository.findStudentsRegisteredToAllTeachers([
        'teacher1@gmail.com',
        'teacher2@gmail.com',
      ]);

      expect(result).toEqual(['common1@gmail.com', 'common2@gmail.com']);
    });

    it('returns empty array when no common students', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await repository.findStudentsRegisteredToAllTeachers([
        'teacher1@gmail.com',
      ]);

      expect(result).toEqual([]);
    });
  });

  describe('findActiveStudentEmailsForTeacher', () => {
    it('returns emails from raw query result', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { email: 'studentbob@gmail.com' },
      ]);

      const result = await repository.findActiveStudentEmailsForTeacher(
        'teacherken@gmail.com',
      );

      expect(result).toEqual(['studentbob@gmail.com']);
    });

    it('returns empty array when teacher has no active students', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await repository.findActiveStudentEmailsForTeacher(
        'teacherken@gmail.com',
      );

      expect(result).toEqual([]);
    });
  });
});
