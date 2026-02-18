import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from './users.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrismaService = {
  class: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  studentCourse: {
    findUnique: jest.fn(),
  },
  attendance: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

const mockUsersService = {
  findStudent: jest.fn(),
};

describe('ClassesService', () => {
  let service: ClassesService;
  let prisma: typeof mockPrismaService;
  let usersService: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    prisma = module.get(PrismaService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a class', async () => {
      const dto = {
        topic: 'Test Class',
        date: new Date('2023-01-01'),
        courseId: 'c1',
      };
      prisma.class.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);
      expect(prisma.class.create).toHaveBeenCalledWith({
        data: dto,
        include: { course: true, attendances: true },
      });
      expect(result).toEqual({ id: '1', ...dto });
    });
  });

  describe('findAllByCourse', () => {
    it('should return classes for a course', async () => {
      prisma.class.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findAllByCourse('c1');
      expect(prisma.class.findMany).toHaveBeenCalledWith({
        where: { courseId: 'c1' },
        include: expect.any(Object),
      });
      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('findOne', () => {
    it('should return a class if found', async () => {
      const classEntity = { id: 'cl1' };
      prisma.class.findUnique.mockResolvedValue(classEntity);

      const result = await service.findOne('cl1');
      expect(result).toBe(classEntity);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.class.findUnique.mockResolvedValue(null);
      await expect(service.findOne('cl1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update class if found', async () => {
      const dto = { topic: 'Updated' };
      prisma.class.findUnique.mockResolvedValue({ id: 'cl1' });
      prisma.class.update.mockResolvedValue({ id: 'cl1', ...dto });

      const result = await service.update('cl1', dto);
      expect(result).toEqual({ id: 'cl1', ...dto });
    });
  });

  describe('remove', () => {
    it('should remove class if found', async () => {
      prisma.class.findUnique.mockResolvedValue({ id: 'cl1' });
      prisma.class.delete.mockResolvedValue({ id: 'cl1' });

      const result = await service.remove('cl1');
      expect(result).toEqual({ id: 'cl1' });
    });
  });

  describe('registerAttendance', () => {
    it('should register attendance for enrolled student', async () => {
      const classEntity = { id: 'cl1', courseId: 'c1' };

      prisma.class.findUnique.mockResolvedValue(classEntity); // findOne
      usersService.findStudent.mockResolvedValue({ id: 's1' });
      prisma.studentCourse.findUnique.mockResolvedValue({ id: 'enr1' }); // enrollment check
      prisma.attendance.findUnique.mockResolvedValue(null); // existing attendance check
      prisma.attendance.create.mockResolvedValue({ id: 'att1' });

      const result = await service.registerAttendance('cl1', 's1');

      expect(usersService.findStudent).toHaveBeenCalledWith('s1');
      expect(prisma.attendance.create).toHaveBeenCalled();
      expect(result).toEqual({ id: 'att1' });
    });

    it('should throw BadRequestException if student is not enrolled', async () => {
      const classEntity = { id: 'cl1', courseId: 'c1' };

      prisma.class.findUnique.mockResolvedValue(classEntity);
      usersService.findStudent.mockResolvedValue({ id: 's1' });
      prisma.studentCourse.findUnique.mockResolvedValue(null); // NOT enrolled

      await expect(service.registerAttendance('cl1', 's1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if attendance already registered', async () => {
      const classEntity = { id: 'cl1', courseId: 'c1' };

      prisma.class.findUnique.mockResolvedValue(classEntity);
      usersService.findStudent.mockResolvedValue({ id: 's1' });
      prisma.studentCourse.findUnique.mockResolvedValue({ id: 'enr1' });
      prisma.attendance.findUnique.mockResolvedValue({ id: 'existing' }); // Already registered

      await expect(service.registerAttendance('cl1', 's1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('removeAttendance', () => {
    it('should remove attendance if found', async () => {
      prisma.class.findUnique.mockResolvedValue({ id: 'cl1' }); // findOne class
      prisma.attendance.findUnique.mockResolvedValue({ id: 'att1' });
      prisma.attendance.delete.mockResolvedValue({ id: 'att1' });

      const result = await service.removeAttendance('cl1', 's1');
      expect(result).toEqual({ id: 'att1' });
    });

    it('should throw NotFoundException if attendance not found', async () => {
      prisma.class.findUnique.mockResolvedValue({ id: 'cl1' });
      prisma.attendance.findUnique.mockResolvedValue(null);

      await expect(service.removeAttendance('cl1', 's1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
