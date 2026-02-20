import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
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

  async createFromGoogle(data: { email: string; name?: string }) {
    const role = this.validateEmailAndGetRole(data.email);
    const name = data.name || this.inferNameFromEmail(data.email);

    return this.prisma.user.create({
      data: {
        email: data.email,
        name,
        password: '',
        role,
      },
    });
  }

  validateEmailAndGetRole(email: string): Role {
    if (!email.endsWith('ufcg.edu.br')) {
      throw new ForbiddenException('Only @ufcg.edu.br emails are allowed');
    }

    const [localPart, domain] = email.split('@');

    // Hack for testing/teachers: +1 in local part
    // OR specific teacher domains
    if (
      localPart.includes('+1') ||
      domain.includes('computacao') ||
      domain.includes('dsc')
    ) {
      return Role.TEACHER;
    }

    if (domain.includes('ccc')) {
      return Role.STUDENT;
    }

    // If it ends with ufcg.edu.br but doesn't match above roles, it's invalid for this system
    // Per user: "não pode adicionar um email q não seja ccc como estudante"
    throw new ForbiddenException(
      'Email must be from @ccc (Student) or @computacao/@dsc (Teacher)',
    );
  }

  inferNameFromEmail(email: string): string {
    const localPart = email.split('@')[0];
    // Remove +1 alias if present for name generation
    const cleanLocal = localPart.replace('+1', '');

    return cleanLocal
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
