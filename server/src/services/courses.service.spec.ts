import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from './users.service';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '../../prisma/generated/prisma/client';

const mockPrismaService = {
  course: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  class: {
    findMany: jest.fn(),
  },
  studentCourse: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    createMany: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

const mockUsersService = {
  findTeacher: jest.fn(),
  findStudent: jest.fn(),
  validateEmailAndGetRole: jest.fn(),
  inferNameFromEmail: jest.fn(),
};

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: typeof mockPrismaService;
  let usersService: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    prisma = module.get(PrismaService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a course', async () => {
      const dto = { name: 'New Course', teacherId: 't1' };
      usersService.findTeacher.mockResolvedValue({ id: 't1' });
      prisma.course.create.mockResolvedValue({ id: 'c1', ...dto });

      const result = await service.create(dto as any, 't1');
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all courses', async () => {
      prisma.course.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('should filter by studentId', async () => {
      prisma.course.findMany.mockResolvedValue([]);
      await service.findAll('s1');
      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { students: { some: { studentId: 's1' } } },
        }),
      );
    });
  });

  describe('update', () => {
    it('should update course if found', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1' });
      prisma.course.update.mockResolvedValue({ id: 'c1', name: 'Updated' });
      const result = await service.update('c1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should remove course if found', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1' });
      prisma.course.delete.mockResolvedValue({ id: 'c1' });
      const result = await service.remove('c1');
      expect(result.id).toBe('c1');
    });
  });

  describe('addStudent', () => {
    it('should add student to course', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1' });
      usersService.findStudent.mockResolvedValue({ id: 's1' });
      prisma.studentCourse.findUnique.mockResolvedValue(null);
      prisma.studentCourse.create.mockResolvedValue({
        studentId: 's1',
        courseId: 'c1',
      });

      const result = await service.addStudent('c1', { studentId: 's1' });
      expect(result.studentId).toBe('s1');
    });

    it('should throw BadRequest if already enrolled', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1' });
      usersService.findStudent.mockResolvedValue({ id: 's1' });
      prisma.studentCourse.findUnique.mockResolvedValue({ studentId: 's1' });

      await expect(
        service.addStudent('c1', { studentId: 's1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeStudent', () => {
    it('should remove student from course', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1' });
      prisma.studentCourse.findUnique.mockResolvedValue({ studentId: 's1' });
      prisma.studentCourse.delete.mockResolvedValue({ studentId: 's1' });

      const result = await service.removeStudent('c1', 's1');
      expect(result.studentId).toBe('s1');
    });

    it('should throw NotFoundException if not enrolled', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1' });
      prisma.studentCourse.findUnique.mockResolvedValue(null);

      await expect(service.removeStudent('c1', 's1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('should return a course if found', async () => {
      const course = { id: 'course-id' };
      prisma.course.findUnique.mockResolvedValue(course);

      const result = await service.findById('course-id');
      expect(result).toBe(course);
      expect(prisma.course.findUnique).toHaveBeenCalledWith({
        where: { id: 'course-id' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.findById('course-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return course for teacher who owns it', async () => {
      const course = { id: 'c1', teacherId: 't1' };
      prisma.course.findUnique.mockResolvedValue(course);

      const result = await service.findOne('c1', {
        id: 't1',
        role: Role.TEACHER,
      } as any);
      expect(result).toBe(course);
    });

    it('should throw ForbiddenException for teacher who does NOT own it', async () => {
      const course = { id: 'c1', teacherId: 't1' };
      prisma.course.findUnique.mockResolvedValue(course);

      await expect(
        service.findOne('c1', { id: 't2', role: Role.TEACHER } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return course for enrolled student with correct attendance', async () => {
      const course = {
        id: 'c1',
        students: [{ studentId: 's1' }],
      };
      const classes = [
        { id: 'cl1', attendances: [{ present: true }] },
        { id: 'cl2', attendances: [] },
      ];

      prisma.course.findUnique.mockResolvedValue(course);
      prisma.class.findMany.mockResolvedValue(classes);

      const result: any = await service.findOne('c1', {
        id: 's1',
        role: Role.STUDENT,
      } as any);

      expect(result.classes).toBeDefined();
      expect(result.classes[0].present).toBe(true);
      expect(result.classes[1].present).toBe(false);
    });

    it('should throw ForbiddenException for non-enrolled student', async () => {
      const course = {
        id: 'c1',
        students: [{ studentId: 'other-student' }],
      };
      prisma.course.findUnique.mockResolvedValue(course);

      await expect(
        service.findOne('c1', { id: 's1', role: Role.STUDENT } as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findStudents', () => {
    it('should return students if teacher owns course', async () => {
      prisma.course.findUnique.mockResolvedValue({ teacherId: 't1' });
      const students = [{ student: { id: 's1' } }];
      prisma.studentCourse.findMany.mockResolvedValue(students);

      const result = await service.findStudents('c1', 't1');
      expect(result).toEqual([{ id: 's1' }]);
    });

    it('should throw ForbiddenException if teacher does not own course', async () => {
      prisma.course.findUnique.mockResolvedValue({ teacherId: 't1' });

      await expect(service.findStudents('c1', 't2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('addStudentsByEmail', () => {
    it('should add valid students who are not enrolled', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1' });
      usersService.validateEmailAndGetRole.mockReturnValue(Role.STUDENT);
      usersService.inferNameFromEmail.mockReturnValue('Student');

      prisma.user.findMany.mockResolvedValue([
        { id: 's1', role: Role.STUDENT, email: 'student@ccc.ufcg.edu.br' },
      ]);
      prisma.studentCourse.findMany.mockResolvedValue([]); // No existing enrollments

      const result = await service.addStudentsByEmail('c1', [
        'student@ccc.ufcg.edu.br',
      ]);

      expect(prisma.studentCourse.createMany).toHaveBeenCalled();
      expect(result.added).toContain('student@ccc.ufcg.edu.br');
    });

    it('should create and add new students if they do not exist', async () => {
      prisma.course.findUnique.mockResolvedValue({ id: 'c1' });
      usersService.validateEmailAndGetRole.mockReturnValue(Role.STUDENT);
      usersService.inferNameFromEmail.mockReturnValue('New');

      prisma.user.findMany.mockResolvedValue([]); // No existing users
      prisma.user.create.mockResolvedValue({
        id: 'new-s1',
        email: 'new@ccc.ufcg.edu.br',
        role: Role.STUDENT,
        name: 'New',
      } as any);
      prisma.studentCourse.findMany.mockResolvedValue([]); // No existing enrollments

      const result = await service.addStudentsByEmail('c1', [
        'new@ccc.ufcg.edu.br',
      ]);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@ccc.ufcg.edu.br',
          name: 'New',
          password: '',
          role: Role.STUDENT,
        },
      });
      expect(prisma.studentCourse.createMany).toHaveBeenCalled();
      expect(result.added).toContain('new@ccc.ufcg.edu.br');
    });

    it('should throw BadRequestException if valid emails are provided but no students created/found', async () => {
      // This case might be if all are invalid or filtered out
      prisma.course.findUnique.mockResolvedValue({ id: 'c1' });
      usersService.validateEmailAndGetRole.mockImplementation(() => {
        throw new ForbiddenException();
      });

      await expect(
        service.addStudentsByEmail('c1', ['invalid@gmail.com']),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
