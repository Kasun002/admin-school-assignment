import { Test, TestingModule } from '@nestjs/testing';
import { StudentsRepository } from '../../students/students.repository';
import { PrismaService } from '../../prisma/prisma.service';

const makeStudent = (email: string, isSuspended = false) => ({
  id: 1,
  email,
  isSuspended,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockPrisma = {
  student: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('StudentsRepository', () => {
  let repository: StudentsRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get(StudentsRepository);
  });

  describe('upsertByEmail', () => {
    it('calls upsert with correct where/create and returns the student', async () => {
      const student = makeStudent('s@test.com');
      mockPrisma.student.upsert.mockResolvedValue(student);

      const result = await repository.upsertByEmail('s@test.com');

      expect(mockPrisma.student.upsert).toHaveBeenCalledWith({
        where: { email: 's@test.com' },
        update: {},
        create: { email: 's@test.com' },
      });
      expect(result).toEqual(student);
    });

    it('does not change isSuspended on re-upsert (update: {})', async () => {
      const suspended = makeStudent('s@test.com', true);
      mockPrisma.student.upsert.mockResolvedValue(suspended);

      const result = await repository.upsertByEmail('s@test.com');

      expect(result.isSuspended).toBe(true);
    });
  });

  describe('findByEmail', () => {
    it('calls findUnique with the email and returns the student', async () => {
      const student = makeStudent('s@test.com');
      mockPrisma.student.findUnique.mockResolvedValue(student);

      const result = await repository.findByEmail('s@test.com');

      expect(mockPrisma.student.findUnique).toHaveBeenCalledWith({
        where: { email: 's@test.com' },
      });
      expect(result).toEqual(student);
    });

    it('returns null when student is not found', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('nobody@test.com');

      expect(result).toBeNull();
    });
  });

  describe('suspend', () => {
    it('calls update to set isSuspended to true', async () => {
      const suspended = makeStudent('s@test.com', true);
      mockPrisma.student.update.mockResolvedValue(suspended);

      await repository.suspend('s@test.com');

      expect(mockPrisma.student.update).toHaveBeenCalledWith({
        where: { email: 's@test.com' },
        data: { isSuspended: true },
      });
    });
  });

  describe('findActiveByEmails', () => {
    it('queries with isSuspended: false and email in list', async () => {
      const emails = ['a@test.com', 'b@test.com'];
      const students = emails.map((e) => makeStudent(e));
      mockPrisma.student.findMany.mockResolvedValue(students);

      const result = await repository.findActiveByEmails(emails);

      expect(mockPrisma.student.findMany).toHaveBeenCalledWith({
        where: { email: { in: emails }, isSuspended: false },
      });
      expect(result).toEqual(students);
    });

    it('returns only non-suspended students from the provided emails', async () => {
      mockPrisma.student.findMany.mockResolvedValue([makeStudent('a@test.com')]);

      const result = await repository.findActiveByEmails([
        'a@test.com',
        'suspended@test.com',
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('a@test.com');
    });
  });

  describe('findWithTeachersPaginated', () => {
    it('resolves students and total via $transaction', async () => {
      const students = [
        { ...makeStudent('s@test.com'), teachers: [{ teacher: { email: 't@test.com' } }] },
      ];
      mockPrisma.$transaction.mockResolvedValue([students, 1]);

      const result = await repository.findWithTeachersPaginated(0, 10);

      expect(result.students).toEqual(students);
      expect(result.total).toBe(1);
    });

    it('passes skip and take to findMany and count', async () => {
      mockPrisma.$transaction.mockImplementation(
        async (ops: Promise<unknown>[]) => Promise.all(ops),
      );
      mockPrisma.student.findMany.mockResolvedValue([]);
      mockPrisma.student.count.mockResolvedValue(0);

      await repository.findWithTeachersPaginated(20, 10);

      expect(mockPrisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('returns empty students and zero total when table is empty', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const result = await repository.findWithTeachersPaginated(0, 10);

      expect(result).toEqual({ students: [], total: 0 });
    });
  });
});
