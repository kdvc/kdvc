import { Test, TestingModule } from '@nestjs/testing';
import { ClassesController } from './classes.controller';
import { ClassesService } from '../services/classes.service';
import { UsersService } from '../services/users.service';
import { BadRequestException } from '@nestjs/common';

const mockClassesService = {
  create: jest.fn(),
  findAllByCourse: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  registerAttendance: jest.fn(),
  removeAttendance: jest.fn(),
};

const mockUsersService = {};

describe('ClassesController', () => {
  let controller: ClassesController;
  let service: typeof mockClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassesController],
      providers: [
        { provide: ClassesService, useValue: mockClassesService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<ClassesController>(ClassesController);
    service = module.get(ClassesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create class', async () => {
    const dto = { topic: 'T', date: '2023-01-01', courseId: 'c1' };
    await controller.create(dto as any);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should find one class', async () => {
    await controller.findOne('cl1');
    expect(service.findOne).toHaveBeenCalledWith('cl1');
  });

  it('should update class', async () => {
    const dto = { topic: 'New' };
    await controller.update('cl1', dto);
    expect(service.update).toHaveBeenCalledWith('cl1', dto);
  });

  it('should remove class', async () => {
    await controller.remove('cl1');
    expect(service.remove).toHaveBeenCalledWith('cl1');
  });

  describe('registerAttendance', () => {
    it('should register attendance for student using their own ID', async () => {
      const result = { id: 'a1', classId: 'c1', studentId: 's1' };
      const req = { user: { id: 's1', role: 'STUDENT' } };
      service.registerAttendance.mockResolvedValue(result);

      await expect(
        controller.registerAttendance('c1', {}, req as any),
      ).resolves.toEqual(result);
      expect(service.registerAttendance).toHaveBeenCalledWith('c1', 's1');
    });

    it('should register attendance for teacher using provided studentID', async () => {
      const result = { id: 'a1', classId: 'c1', studentId: 's2' };
      const req = { user: { id: 't1', role: 'TEACHER' } };
      service.registerAttendance.mockResolvedValue(result);

      await expect(
        controller.registerAttendance('c1', { studentId: 's2' }, req as any),
      ).resolves.toEqual(result);
      expect(service.registerAttendance).toHaveBeenCalledWith('c1', 's2');
    });

    it('should throw BadRequestException if teacher provides no studentId', () => {
      const req = { user: { id: 't1', role: 'TEACHER' } };
      expect(() => controller.registerAttendance('c1', {}, req as any)).toThrow(
        BadRequestException,
      );
    });
  });

  it('should remove attendance', async () => {
    await controller.removeAttendance('cl1', 's1');
    expect(service.removeAttendance).toHaveBeenCalledWith('cl1', 's1');
  });
});
