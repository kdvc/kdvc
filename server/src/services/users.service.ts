import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../../prisma/generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto, UpdateUserDto } from '../dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException(
        `User with email ${data.email} already exists`,
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { ...data, password: hashedPassword },
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
    await this.findOne(id);

    if (data.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `User with email ${data.email} already exists`,
        );
      }
    }

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

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createFromGoogle(data: { email: string; name: string }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: '',
        role: Role.STUDENT, // Default role
      },
    });
  }
}
