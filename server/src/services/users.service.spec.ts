import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from '../../prisma/generated/prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const dto = {
        email: 'test@test.com',
        password: 'pass',
        name: 'Test',
        role: Role.STUDENT,
      };
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPass');
      prisma.user.create.mockResolvedValue({
        ...dto,
        id: '1',
        password: 'hashedPass',
      });

      const result = await service.create(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { ...dto, password: 'hashedPass' },
      });
      expect(result).toEqual({ ...dto, id: '1', password: 'hashedPass' });
    });

    it('should throw ConflictException if email already exists', async () => {
      const dto = {
        email: 'test@test.com',
        password: 'pass',
        name: 'Test',
        role: Role.STUDENT,
      };
      prisma.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const users = [{ id: '1' }, { id: '2' }];
      prisma.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toBe(users);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const user = { id: '1' };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('1');
      expect(result).toBe(user);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findStudent', () => {
    it('should return user if found and is STUDENT', async () => {
      const user = { id: '1', role: Role.STUDENT };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findStudent('1');
      expect(result).toBe(user);
    });

    it('should throw NotFoundException if user is NOT STUDENT', async () => {
      const user = { id: '1', role: Role.TEACHER };
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(service.findStudent('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findTeacher', () => {
    it('should return user if found and is TEACHER', async () => {
      const user = { id: '1', role: Role.TEACHER };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findTeacher('1');
      expect(result).toBe(user);
    });

    it('should throw NotFoundException if user is NOT TEACHER', async () => {
      const user = { id: '1', role: Role.STUDENT };
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(service.findTeacher('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user if found', async () => {
      const dto = { name: 'New Name' };
      prisma.user.findUnique.mockResolvedValue({ id: '1' });
      prisma.user.update.mockResolvedValue({ id: '1', ...dto });

      const result = await service.update('1', dto);
      expect(result).toEqual({ id: '1', ...dto });
    });

    it('should throw ConflictException if email is taken by another user', async () => {
      const dto = { email: 'taken@test.com' };
      prisma.user.findUnique
        .mockResolvedValueOnce({ id: '1' }) // findOne check
        .mockResolvedValueOnce({ id: '2', email: 'taken@test.com' }); // email check

      await expect(service.update('1', dto)).rejects.toThrow(ConflictException);
    });

    it('should NOT throw ConflictException if email is same as user', async () => {
      const dto = { email: 'mine@test.com' };
      prisma.user.findUnique
        .mockResolvedValueOnce({ id: '1', email: 'mine@test.com' }) // findOne check
        .mockResolvedValueOnce({ id: '1', email: 'mine@test.com' }); // email check

      prisma.user.update.mockResolvedValue({ id: '1', ...dto });

      const result = await service.update('1', dto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete user if found', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1' });
      prisma.user.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const user = { id: '1', email: 'test@test.com' };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail('test@test.com');
      expect(result).toBe(user);
    });
  });

  describe('createFromGoogle', () => {
    it('should create user from google data', async () => {
      const data = { email: 'g@test.com', name: 'Google User' };
      prisma.user.create.mockResolvedValue({
        ...data,
        id: '1',
        role: Role.STUDENT,
      });

      const result = await service.createFromGoogle(data);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: data.email,
          name: data.name,
          password: '',
          role: Role.STUDENT,
        },
      });
      expect(result).toEqual({ ...data, id: '1', role: Role.STUDENT });
    });
  });
});
