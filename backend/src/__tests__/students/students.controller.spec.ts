import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from '../../students/students.controller';
import { StudentsService } from '../../students/students.service';

const mockService = {
  findWithTeachersPaginated: jest.fn(),
};

describe('StudentsController', () => {
  let controller: StudentsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [{ provide: StudentsService, useValue: mockService }],
    }).compile();

    controller = module.get(StudentsController);
  });

  describe('getStudents', () => {
    it('delegates page and limit to service', async () => {
      const response = { data: [], total: 0, page: 2, limit: 10 };
      mockService.findWithTeachersPaginated.mockResolvedValue(response);

      await controller.getStudents({ page: 2, limit: 10 });

      expect(mockService.findWithTeachersPaginated).toHaveBeenCalledWith(2, 10);
    });

    it('returns the paginated response from service', async () => {
      const response = {
        data: [{ email: 's@test.com', isSuspended: false, teachers: [] }],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockService.findWithTeachersPaginated.mockResolvedValue(response);

      const result = await controller.getStudents({ page: 1, limit: 10 });

      expect(result).toEqual(response);
    });

    it('uses default page and limit values from the DTO', async () => {
      mockService.findWithTeachersPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.getStudents({ page: 1, limit: 10 });

      expect(mockService.findWithTeachersPaginated).toHaveBeenCalledWith(1, 10);
    });
  });
});
