import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '../../prisma/generated/prisma/client';
import { PrismaService } from '../database/prisma.service';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findStudent(id: string) {
    const user = await this.findOne(id);

    if (user.role !== Role.STUDENT) {
      throw new NotFoundException(`User with ID ${id} is not a student`);
    }

    return user;
  }

  async findTeacher(id: string) {
    const user = await this.findOne(id);

    if (user.role !== Role.TEACHER) {
      throw new NotFoundException(`User with ID ${id} is not a teacher`);
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
