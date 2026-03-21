import { Test, TestingModule } from '@nestjs/testing';
import { TeachersService } from '../../teachers/teachers.service';
import { TeachersRepository } from '../../teachers/teachers.repository';

const makeTeacher = (email: string) => ({
  id: 1,
  email,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('TeachersService', () => {
  let service: TeachersService;
  let repository: jest.Mocked<TeachersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        {
          provide: TeachersRepository,
          useValue: {
            upsertByEmail: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(TeachersService);
    repository = module.get(TeachersRepository);
  });

  describe('upsertByEmail', () => {
    it('delegates to repository and returns teacher', async () => {
      const teacher = makeTeacher('t@test.com');
      repository.upsertByEmail.mockResolvedValue(teacher);

      const result = await service.upsertByEmail('t@test.com');

      expect(repository.upsertByEmail).toHaveBeenCalledWith('t@test.com');
      expect(result).toEqual(teacher);
    });
  });

  describe('findByEmail', () => {
    it('returns teacher when found', async () => {
      const teacher = makeTeacher('t@test.com');
      repository.findByEmail.mockResolvedValue(teacher);

      const result = await service.findByEmail('t@test.com');

      expect(result).toEqual(teacher);
    });

    it('returns null when teacher does not exist', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('nobody@test.com');

      expect(result).toBeNull();
    });
  });
});
