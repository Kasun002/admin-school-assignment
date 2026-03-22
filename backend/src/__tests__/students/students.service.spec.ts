import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getLoggerToken } from 'nestjs-pino';
import { StudentsService } from '../../students/students.service';
import { StudentsRepository } from '../../students/students.repository';

const mockLogger = { info: jest.fn() };

const makeStudent = (email: string, isSuspended = false) => ({
  id: 1,
  email,
  isSuspended,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('StudentsService', () => {
  let service: StudentsService;
  let repository: jest.Mocked<StudentsRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getLoggerToken(StudentsService.name),
          useValue: mockLogger,
        },
        {
          provide: StudentsRepository,
          useValue: {
            upsertByEmail: jest.fn(),
            findByEmail: jest.fn(),
            suspend: jest.fn(),
            findActiveByEmails: jest.fn(),
            findWithTeachersPaginated: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(StudentsService);
    repository = module.get(StudentsRepository);
  });

  describe('upsertByEmail', () => {
    it('delegates to repository and returns the result', async () => {
      const student = makeStudent('s@test.com');
      repository.upsertByEmail.mockResolvedValue(student);

      const result = await service.upsertByEmail('s@test.com');

      expect(repository.upsertByEmail).toHaveBeenCalledWith('s@test.com');
      expect(result).toEqual(student);
    });
  });

  describe('findByEmail', () => {
    it('returns student when found', async () => {
      const student = makeStudent('s@test.com');
      repository.findByEmail.mockResolvedValue(student);

      const result = await service.findByEmail('s@test.com');

      expect(result).toEqual(student);
    });

    it('returns null when not found', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('nobody@test.com');

      expect(result).toBeNull();
    });
  });

  describe('suspend', () => {
    it('throws NotFoundException when student does not exist', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(service.suspend('nobody@test.com')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('includes the email in the NotFoundException message', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(service.suspend('nobody@test.com')).rejects.toThrow(
        'nobody@test.com',
      );
    });

    it('calls repository.suspend when student exists', async () => {
      repository.findByEmail.mockResolvedValue(makeStudent('s@test.com'));
      repository.suspend.mockResolvedValue(makeStudent('s@test.com', true));

      await service.suspend('s@test.com');

      expect(repository.suspend).toHaveBeenCalledWith('s@test.com');
    });

    it('does not call repository.suspend when student is not found', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(service.suspend('nobody@test.com')).rejects.toThrow();
      expect(repository.suspend).not.toHaveBeenCalled();
    });

    it('logs info after successful suspension', async () => {
      repository.findByEmail.mockResolvedValue(makeStudent('s@test.com'));
      repository.suspend.mockResolvedValue(makeStudent('s@test.com', true));

      await service.suspend('s@test.com');

      expect(mockLogger.info).toHaveBeenCalledWith(
        { email: 's@test.com' },
        'Student suspended',
      );
    });
  });

  describe('findActiveByEmails', () => {
    it('delegates to repository', async () => {
      const emails = ['a@test.com', 'b@test.com'];
      const students = emails.map((e) => makeStudent(e));
      repository.findActiveByEmails.mockResolvedValue(students);

      const result = await service.findActiveByEmails(emails);

      expect(repository.findActiveByEmails).toHaveBeenCalledWith(emails);
      expect(result).toEqual(students);
    });

    it('returns empty array when no active students match', async () => {
      repository.findActiveByEmails.mockResolvedValue([]);

      const result = await service.findActiveByEmails(['suspended@test.com']);

      expect(result).toEqual([]);
    });
  });

  describe('findWithTeachersPaginated', () => {
    it('calculates correct skip: (page - 1) * limit', async () => {
      repository.findWithTeachersPaginated.mockResolvedValue({
        students: [],
        total: 0,
      });

      await service.findWithTeachersPaginated(3, 10);

      expect(repository.findWithTeachersPaginated).toHaveBeenCalledWith(20, 10);
    });

    it('maps raw student data to the response DTO shape', async () => {
      const raw = {
        ...makeStudent('s@test.com'),
        teachers: [{ teacher: { email: 'teacher@test.com' } }],
      };
      repository.findWithTeachersPaginated.mockResolvedValue({
        students: [raw],
        total: 1,
      });

      const result = await service.findWithTeachersPaginated(1, 10);

      expect(result.data[0]).toEqual({
        email: 's@test.com',
        isSuspended: false,
        teachers: ['teacher@test.com'],
      });
    });

    it('maps a student with no teachers to an empty teachers array', async () => {
      const raw = { ...makeStudent('s@test.com'), teachers: [] };
      repository.findWithTeachersPaginated.mockResolvedValue({
        students: [raw],
        total: 1,
      });

      const result = await service.findWithTeachersPaginated(1, 10);

      expect(result.data[0].teachers).toEqual([]);
    });

    it('returns correct pagination metadata', async () => {
      repository.findWithTeachersPaginated.mockResolvedValue({
        students: [],
        total: 42,
      });

      const result = await service.findWithTeachersPaginated(2, 15);

      expect(result).toMatchObject({ total: 42, page: 2, limit: 15 });
    });
  });
});
