import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from '../services/courses.service';
import { ClassesService } from '../services/classes.service';
import { UsersService } from '../services/users.service';
import { Role } from '../../prisma/generated/prisma/client';

const mockCoursesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  addStudent: jest.fn(),
  findStudents: jest.fn(),
  addStudentsByEmail: jest.fn(),
  removeStudent: jest.fn(),
};

const mockClassesService = {
  findAllByCourse: jest.fn(),
};

const mockUsersService = {};

describe('CoursesController', () => {
  let controller: CoursesController;
  let coursesService: typeof mockCoursesService;
  let classesService: typeof mockClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: CoursesService, useValue: mockCoursesService },
        { provide: ClassesService, useValue: mockClassesService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    coursesService = module.get(CoursesService);
    classesService = module.get(ClassesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call service.create with user id', async () => {
      const dto = { name: 'Test Course', teacherId: 't1' };
      const req = { user: { id: 'u1' } };
      await controller.create(dto as any, req as any);
      expect(coursesService.create).toHaveBeenCalledWith(dto, 'u1');
    });

    it('should propagate service errors', async () => {
      const dto = { name: 'Test Course', teacherId: 't1' };
      const req = { user: { id: 'u1' } };
      coursesService.create.mockRejectedValue(new Error('Service Error'));
      await expect(controller.create(dto as any, req as any)).rejects.toThrow(
        'Service Error',
      );
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with user id if student', async () => {
      const req = { user: { id: 'u1', role: Role.STUDENT } };
      await controller.findAll(req as any);
      expect(coursesService.findAll).toHaveBeenCalledWith('u1');
    });

    it('should call service.findAll with undefined if teacher', async () => {
      const req = { user: { id: 'u1', role: Role.TEACHER } };
      await controller.findAll(req as any);
      expect(coursesService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should propagate service errors', async () => {
      const req = { user: { id: 'u1', role: Role.STUDENT } };
      coursesService.findAll.mockRejectedValue(new Error('Service Error'));
      await expect(controller.findAll(req as any)).rejects.toThrow(
        'Service Error',
      );
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id and user', async () => {
      const req = { user: { id: 'u1' } };
      await controller.findOne('c1', req as any);
      expect(coursesService.findOne).toHaveBeenCalledWith('c1', req.user);
    });

    it('should propagate service errors', async () => {
      const req = { user: { id: 'u1' } };
      coursesService.findOne.mockRejectedValue(new Error('Service Error'));
      await expect(controller.findOne('c1', req as any)).rejects.toThrow(
        'Service Error',
      );
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto = { name: 'Updated' };
      await controller.update('c1', dto);
      expect(coursesService.update).toHaveBeenCalledWith('c1', dto);
    });

    it('should propagate service errors', async () => {
      const dto = { name: 'Updated' };
      coursesService.update.mockRejectedValue(new Error('Service Error'));
      await expect(controller.update('c1', dto)).rejects.toThrow(
        'Service Error',
      );
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      await controller.remove('c1');
      expect(coursesService.remove).toHaveBeenCalledWith('c1');
    });

    it('should propagate service errors', async () => {
      coursesService.remove.mockRejectedValue(new Error('Service Error'));
      await expect(controller.remove('c1')).rejects.toThrow('Service Error');
    });
  });

  describe('addStudent', () => {
    it('should call service.addStudent', async () => {
      const dto = { studentId: 's1' };
      await controller.addStudent('c1', dto);
      expect(coursesService.addStudent).toHaveBeenCalledWith('c1', dto);
    });

    it('should propagate service errors', async () => {
      const dto = { studentId: 's1' };
      coursesService.addStudent.mockRejectedValue(new Error('Service Error'));
      await expect(controller.addStudent('c1', dto)).rejects.toThrow(
        'Service Error',
      );
    });
  });

  describe('findStudents', () => {
    it('should call service.findStudents', async () => {
      const req = { user: { id: 't1' } };
      await controller.findStudents('c1', req as any);
      expect(coursesService.findStudents).toHaveBeenCalledWith('c1', 't1');
    });

    it('should propagate service errors', async () => {
      const req = { user: { id: 't1' } };
      coursesService.findStudents.mockRejectedValue(new Error('Service Error'));
      await expect(controller.findStudents('c1', req as any)).rejects.toThrow(
        'Service Error',
      );
    });
  });

  describe('addStudentsByEmail', () => {
    it('should call service.addStudentsByEmail', async () => {
      const body = { emails: ['s1@test.com'] };
      await controller.addStudentsByEmail('c1', body);
      expect(coursesService.addStudentsByEmail).toHaveBeenCalledWith(
        'c1',
        body.emails,
      );
    });

    it('should propagate service errors', async () => {
      const body = { emails: ['s1@test.com'] };
      coursesService.addStudentsByEmail.mockRejectedValue(
        new Error('Service Error'),
      );
      await expect(controller.addStudentsByEmail('c1', body)).rejects.toThrow(
        'Service Error',
      );
    });
  });

  describe('removeStudent', () => {
    it('should call service.removeStudent', async () => {
      await controller.removeStudent('c1', 's1');
      expect(coursesService.removeStudent).toHaveBeenCalledWith('c1', 's1');
    });

    it('should propagate service errors', async () => {
      coursesService.removeStudent.mockRejectedValue(
        new Error('Service Error'),
      );
      await expect(controller.removeStudent('c1', 's1')).rejects.toThrow(
        'Service Error',
      );
    });
  });

  describe('findClasses', () => {
    it('should call classesService.findAllByCourse', async () => {
      await controller.findClasses('c1');
      expect(classesService.findAllByCourse).toHaveBeenCalledWith('c1');
    });

    it('should propagate service errors', async () => {
      classesService.findAllByCourse.mockRejectedValue(
        new Error('Service Error'),
      );
      await expect(controller.findClasses('c1')).rejects.toThrow(
        'Service Error',
      );
    });
  });
});
