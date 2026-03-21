import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsController } from '../../registrations/registrations.controller';
import { RegistrationsService } from '../../registrations/registrations.service';

const mockService = {
  register: jest.fn(),
  getCommonStudents: jest.fn(),
  suspendStudent: jest.fn(),
  retrieveForNotifications: jest.fn(),
};

describe('RegistrationsController', () => {
  let controller: RegistrationsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationsController],
      providers: [{ provide: RegistrationsService, useValue: mockService }],
    }).compile();

    controller = module.get(RegistrationsController);
  });

  describe('register', () => {
    it('delegates to service and returns void', async () => {
      mockService.register.mockResolvedValue(undefined);
      const dto = { teacher: 't@test.com', students: ['s@test.com'] };

      const result = await controller.register(dto);

      expect(mockService.register).toHaveBeenCalledWith(dto);
      expect(result).toBeUndefined();
    });
  });

  describe('commonStudents', () => {
    it('passes validated teacher array from query DTO to service', async () => {
      mockService.getCommonStudents.mockResolvedValue({ students: [] });
      const query = { teacher: ['teacher1@gmail.com', 'teacher2@gmail.com'] };

      await controller.commonStudents(query);

      expect(mockService.getCommonStudents).toHaveBeenCalledWith(query.teacher);
    });

    it('returns the service result', async () => {
      const response = { students: ['common@gmail.com'] };
      mockService.getCommonStudents.mockResolvedValue(response);

      const result = await controller.commonStudents({
        teacher: ['t@test.com'],
      });

      expect(result).toEqual(response);
    });
  });

  describe('suspend', () => {
    it('delegates student email to service', async () => {
      mockService.suspendStudent.mockResolvedValue(undefined);
      const dto = { student: 'studentmary@gmail.com' };

      await controller.suspend(dto);

      expect(mockService.suspendStudent).toHaveBeenCalledWith(dto.student);
    });
  });

  describe('retrieveForNotifications', () => {
    it('delegates dto to service and returns result', async () => {
      const response = { recipients: ['studentbob@gmail.com'] };
      mockService.retrieveForNotifications.mockResolvedValue(response);
      const dto = { teacher: 't@test.com', notification: 'Hey everybody' };

      const result = await controller.retrieveForNotifications(dto);

      expect(mockService.retrieveForNotifications).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });
  });
});
