import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsRepository } from '../../registrations/registrations.repository';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  teacherStudent: {
    upsert: jest.fn(),
  },
  student: {
    findMany: jest.fn(),
  },
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
    it('returns emails of students registered to all given teachers', async () => {
      // DB returns students linked to at least one teacher; JS filter keeps only those linked to ALL
      mockPrisma.student.findMany.mockResolvedValue([
        {
          email: 'common1@gmail.com',
          teachers: [{ teacherId: 1 }, { teacherId: 2 }],
        },
        {
          email: 'common2@gmail.com',
          teachers: [{ teacherId: 1 }, { teacherId: 2 }],
        },
        {
          // linked to only one of the two teachers — should be excluded
          email: 'partial@gmail.com',
          teachers: [{ teacherId: 1 }],
        },
      ]);

      const result = await repository.findStudentsRegisteredToAllTeachers([
        'teacher1@gmail.com',
        'teacher2@gmail.com',
      ]);

      expect(result).toEqual(['common1@gmail.com', 'common2@gmail.com']);
    });

    it('returns empty array when no common students', async () => {
      mockPrisma.student.findMany.mockResolvedValue([]);

      const result = await repository.findStudentsRegisteredToAllTeachers([
        'teacher1@gmail.com',
      ]);

      expect(result).toEqual([]);
    });
  });

  describe('findActiveStudentEmailsForTeacher', () => {
    it('returns emails of active students for a teacher', async () => {
      mockPrisma.student.findMany.mockResolvedValue([
        { email: 'studentbob@gmail.com' },
      ]);

      const result = await repository.findActiveStudentEmailsForTeacher(
        'teacherken@gmail.com',
      );

      expect(result).toEqual(['studentbob@gmail.com']);
    });

    it('returns empty array when teacher has no active students', async () => {
      mockPrisma.student.findMany.mockResolvedValue([]);

      const result = await repository.findActiveStudentEmailsForTeacher(
        'teacherken@gmail.com',
      );

      expect(result).toEqual([]);
    });
  });
});
