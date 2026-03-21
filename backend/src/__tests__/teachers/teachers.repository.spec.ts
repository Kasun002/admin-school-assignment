import { Test, TestingModule } from '@nestjs/testing';
import { TeachersRepository } from '../../teachers/teachers.repository';
import { PrismaService } from '../../prisma/prisma.service';

const makeTeacher = (email: string) => ({
  id: 1,
  email,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockPrisma = {
  teacher: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('TeachersRepository', () => {
  let repository: TeachersRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get(TeachersRepository);
  });

  describe('upsertByEmail', () => {
    it('calls upsert with correct where/create and returns the teacher', async () => {
      const teacher = makeTeacher('t@test.com');
      mockPrisma.teacher.upsert.mockResolvedValue(teacher);

      const result = await repository.upsertByEmail('t@test.com');

      expect(mockPrisma.teacher.upsert).toHaveBeenCalledWith({
        where: { email: 't@test.com' },
        update: {},
        create: { email: 't@test.com' },
      });
      expect(result).toEqual(teacher);
    });

    it('is idempotent: update: {} leaves existing teacher unchanged', async () => {
      const existing = makeTeacher('t@test.com');
      mockPrisma.teacher.upsert.mockResolvedValue(existing);

      const first = await repository.upsertByEmail('t@test.com');
      const second = await repository.upsertByEmail('t@test.com');

      expect(first).toEqual(second);
    });
  });

  describe('findByEmail', () => {
    it('calls findUnique with the email and returns the teacher', async () => {
      const teacher = makeTeacher('t@test.com');
      mockPrisma.teacher.findUnique.mockResolvedValue(teacher);

      const result = await repository.findByEmail('t@test.com');

      expect(mockPrisma.teacher.findUnique).toHaveBeenCalledWith({
        where: { email: 't@test.com' },
      });
      expect(result).toEqual(teacher);
    });

    it('returns null when teacher is not found', async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('nobody@test.com');

      expect(result).toBeNull();
    });
  });
});
