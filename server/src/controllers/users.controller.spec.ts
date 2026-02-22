import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/users.dto';
import { UnauthorizedException } from '@nestjs/common';

const mockUsersService = {
  create: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create user', async () => {
      const dto = {
        name: 'Use',
        email: 'e@e.com',
        password: 'p',
        role: 'STUDENT',
      };
      await controller.create(dto as CreateUserDto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should propagate service errors', async () => {
      const dto = {
        name: 'Use',
        email: 'e@e.com',
        password: 'p',
        role: 'STUDENT',
      };
      service.create.mockRejectedValue(new Error('Service Error'));
      await expect(controller.create(dto as CreateUserDto)).rejects.toThrow(
        'Service Error',
      );
    });
  });

  describe('findOne', () => {
    it('should find user', async () => {
      await controller.findOne('u1');
      expect(service.findOne).toHaveBeenCalledWith('u1');
    });

    it('should propagate service errors', async () => {
      service.findOne.mockRejectedValue(new Error('Service Error'));
      await expect(controller.findOne('u1')).rejects.toThrow('Service Error');
    });
  });

  describe('update', () => {
    it('should update user if ids match', async () => {
      const dto = { name: 'New' };
      const req = { user: { id: 'u1' } };
      await controller.update('u1', dto, req as unknown as Request);
      expect(service.update).toHaveBeenCalledWith('u1', dto);
    });

    it('should throw UnauthorizedException if ids do not match', () => {
      const dto = { name: 'New' };
      const req = { user: { id: 'u2' } };
      expect(() =>
        controller.update('u1', dto, req as unknown as Request),
      ).toThrow(UnauthorizedException);
    });

    it('should propagate service errors', async () => {
      const dto = { name: 'New' };
      const req = { user: { id: 'u1' } };
      service.update.mockRejectedValue(new Error('Service Error'));
      await expect(
        controller.update('u1', dto, req as unknown as Request),
      ).rejects.toThrow('Service Error');
    });
  });

  describe('remove', () => {
    it('should remove user if ids match', async () => {
      const req = { user: { id: 'u1' } };
      await controller.remove('u1', req as unknown as Request);
      expect(service.remove).toHaveBeenCalledWith('u1');
    });

    it('should throw UnauthorizedException if ids do not match', () => {
      const req = { user: { id: 'u2' } };
      expect(() => controller.remove('u1', req as unknown as Request)).toThrow(
        UnauthorizedException,
      );
    });

    it('should propagate service errors', async () => {
      const req = { user: { id: 'u1' } };
      service.remove.mockRejectedValue(new Error('Service Error'));
      await expect(
        controller.remove('u1', req as unknown as Request),
      ).rejects.toThrow('Service Error');
    });
  });
});
